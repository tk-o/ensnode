import {
  Address,
  bytesToHex,
  bytesToString,
  concat,
  isAddress,
  isHash,
  keccak256,
  stringToBytes,
  toHex,
} from "viem";

import { labelhash } from "viem/ens";
import type { Label, LabelHash, Name, Node } from "./types";

/**
 * Implements one step of the namehash algorithm, combining `labelHash` with `node` to produce
 * the `node` of a given subdomain. Note that the order of the arguments is 'reversed' (as compared to
 * the actual concatenation) in order to improve readability (i.e. read as [labelHash].[node]).
 */
export const makeSubdomainNode = (labelHash: LabelHash, node: Node): Node =>
  keccak256(concat([node, labelHash]));

/**
 * Gets the Label used for subnames of "addr.reverse" used for reverse lookups of `address` as per
 * https://docs.ens.domains/resolution/names#reverse-nodes
 */
const addrReverseLabel = (address: Address): Label => address.slice(2).toLowerCase();

/**
 * Attempt to heal the labelHash of an addr.reverse subname using an address that might be related to the subname.
 *
 * @throws if maybeReverseAddress is not a valid Address
 * @throws if labelHash is not a valid Labelhash
 *
 * @returns the original label if healed, otherwise null
 */
export const maybeHealLabelByReverseAddress = ({
  maybeReverseAddress,
  labelHash,
}: {
  /** The address that is possibly associated with the addr.reverse subname */
  maybeReverseAddress: Address;

  /** The labelhash of the addr.reverse subname */
  labelHash: LabelHash;
}): string | null => {
  // check if required arguments are valid
  if (!isAddress(maybeReverseAddress)) {
    throw new Error(
      `Invalid reverse address: '${maybeReverseAddress}'. Must be a valid EVM Address.`,
    );
  }

  if (!isHash(labelHash)) {
    throw new Error(
      `Invalid labelHash: '${labelHash}'. Must start with '0x' and represent 32 bytes.`,
    );
  }

  // derive the assumed label from the normalized address
  const assumedLabel = addrReverseLabel(maybeReverseAddress);

  // if labelHash of the assumed label matches the provided labelHash, heal
  if (labelhash(assumedLabel) === labelHash) return assumedLabel;

  // otherwise, healing did not succeed
  // TODO: log the event args for analysis and debugging
  return null;
};

/**
 * Encodes a uint256 bigint as hex string sized to 32 bytes.
 * Uses include, in the context of ENS, decoding the uint256-encoded tokenId of NFT-issuing contracts
 * into Node or LabelHash, which is a common behavior in the ENS ecosystem.
 * (see NameWrapper, ETHRegistrarController)
 */
export const uint256ToHex32 = (num: bigint) => toHex(num, { size: 32 });

/**
 * These characters are prohibited in normalized ENS names per the ENSIP-15
 * standard (https://docs.ens.domains/ensip/15). Names containing labels with
 * one or more of these characters are unusable by any app implementing
 * ENSIP-15 (e.g., via https://github.com/adraffy/ens-normalize.js
 * or https://github.com/namehash/ens-normalize-python).
 *
 * While many other characters (beyond these 4) are not supported by
 * ENSIP-15, only the following 4 characters are classified as "unindexable" due
 * to specific indexing concerns.
 *
 * Onchain ENS contracts do not enforce ENSIP-15 normalization for reasons
 * including the gas costs of enforcement. This allows unnormalized labels
 * containing these characters to exist onchain. Such labels must be handled
 * carefully by indexers to avoid conflicts.
 *
 * Some indexed labels are "unknown" (or "unindexable") but still require a
 * representation within indexed data. For this purpose, a special "unknown
 * label" format is defined (an EncodedLabelHash) that represents these labels in the format of
 * "[{labelHash}]" where {labelHash} is the labelHash of the unknown label.
 * When an indexed label is in this format it is necessary to distinguish an
 * "unknown" label containing a labelHash, from an unnormalized label literal
 * that is formatted to appear like an "unknown" label. For example, if the
 * unnormalized label literal
 * "[24695ee963d29f0f52edfdea1e830d2fcfc9052d5ba70b194bddd0afbbc89765]"
 * is indexed, it will be considered "unindexable" (due to the square bracket
 * characters) and therefore be represented as the following "unknown" label instead
 * "[80968d00b78a91f47b233eaa213576293d16dadcbbdceb257bca94b08451ba7f]"
 * which encodes the labelHash of the unnormalized label literal in
 * square brackets.
 */
const UNINDEXABLE_LABEL_CHARACTERS = [
  "\0", // null byte: PostgreSQL does not allow storing this character in text fields.
  ".", // conflicts with ENS label separator logic.
  "[", // conflicts with "unknown label" representations.
  "]", // conflicts with "unknown label" representations.
];

const UNINDEXABLE_LABEL_CHARACTER_CODES = new Set(
  UNINDEXABLE_LABEL_CHARACTERS.map((char) => char.charCodeAt(0)),
);

/**
 * Check if any characters in `label` are "unindexable".
 *
 * Related logic in ENS Subgraph:
 * https://github.com/ensdomains/ens-subgraph/blob/c844791/src/utils.ts#L68
 *
 * @param label - The label to check. Note:
 * A `null` value for `label` represents an unhealable labelhash.
 *
 * @returns `true` if the label is indexable, `false` otherwise.
 */
export const isLabelIndexable = (label: Label | null): label is Label => {
  if (!label) return false;

  for (let i = 0; i < label.length; i++) {
    if (UNINDEXABLE_LABEL_CHARACTER_CODES.has(label.charCodeAt(i))) return false;
  }

  return true;
};

/**
 * NOTE: there seems to be a bug in ensjs#bytesToPacket regarding malformed names, which we were
 * originally using for this function.
 *
 * For example, in this tx `0x4ece50ae828f2a0f27f45d086e85a55e6284bff31a0a89daca9df4b1b1f5cb75` the
 * `name` input is `8436.eth` (it should have been just `8436`, as the `.eth` is inferred).
 *
 * This operates against a name that actually looks like `[fb1d24d5dc41613d5b4874e6cccb06ecf442f6f1773c3771c4fcce1161985a18].eth`
 * which results in a namehash of `0xfb1d24d5dc41613d5b4874e6cccb06ecf442f6f1773c3771c4fcce1161985a18`
 * and the NameWrapper emits an event with the packet bytes of `08383433362E6574680365746800`.
 * when ensjs#bytesToPacket sees these bytes, it returns a name of `8436.eth.eth`, which is incorrect.
 *
 * The original subgraph logic handled this case correctly, it seems, and so we re-implement it here.
 * https://github.com/ensdomains/ens-subgraph/blob/c844791/src/nameWrapper.ts#L30
 *
 * More information about this discussion can be found in this thread:
 * https://github.com/namehash/ensnode/issues/36
 *
 * TODO: replace this function with ensjs#bytesToPacket when it correctly handles these cases. See
 * ensnode commit hash bace0ab55077d9f5cd37bd9d6638c4acb16334a8 for an example implementation.
 *
 */
export function decodeDNSPacketBytes(buf: Uint8Array): [Label | null, Name | null] {
  let offset = 0;
  let list = new Uint8Array(0);
  let dot = stringToBytes(".");
  let len = buf[offset++];
  let hex = bytesToHex(buf);
  let firstLabel = "";
  if (len === 0) {
    return [firstLabel, "."];
  }

  while (len) {
    const label = hex.slice((offset + 1) * 2, (offset + 1 + len) * 2);
    const labelBytes = Buffer.from(label, "hex");

    if (!isLabelIndexable(labelBytes.toString())) {
      return [null, null];
    }

    if (offset > 1) {
      list = concatUint8Arrays(list, dot);
    } else {
      firstLabel = labelBytes.toString();
    }
    list = concatUint8Arrays(list, labelBytes);
    offset += len;
    len = buf[offset++];
  }
  return [firstLabel, bytesToString(list)];
}

function concatUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  const concatenatedArray = new Uint8Array(a.length + b.length);
  concatenatedArray.set(a);
  concatenatedArray.set(b, a.length);
  return concatenatedArray;
}
