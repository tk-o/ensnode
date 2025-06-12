/**
 * EFP List Storage Location utilities
 */

import type { ENSDeploymentChain } from "@ensnode/ens-deployments";
import type { Address } from "viem";
import { base, baseSepolia, mainnet, optimism, optimismSepolia, sepolia } from "viem/chains";
import { getAddress } from "viem/utils";
import { prettifyError, z } from "zod/v4";
import {
  type ListStorageLocationContract,
  ListStorageLocationType,
  ListStorageLocationVersion,
} from "./types";

/**
 * An encoded List Storage Location is a bytes array with the following structure:
 * - `version`: A uint8 representing the version of the List Storage Location. This is used to ensure compatibility and facilitate future upgrades.
 * - `location_type`: A uint8 indicating the type of list storage location. This identifies the kind of data the data field contains..
 * - `data:` A bytes array containing the actual data of the list storage location. The structure of this data depends on the location type.
 */
type EncodedLsl = string;

// NOTE: based on code from https://github.com/ethereumfollowprotocol/onchain/blob/f3c970e/src/efp.ts#L95-L123
/**
 * Parses an encoded List Storage Location string and returns a decoded ListStorageLocation object.
 *
 * @param {ENSDeploymentChain} ensDeploymentChain - The ENS Deployment Chain
 * @param {EncodedLsl} encodedLsl - The encoded List Storage Location string to parse.
 * @returns A decoded {@link ListStorageLocationContract} object.
 * @throws An error if parsing could not be completed successfully.
 */
export function decodeListStorageLocationContract(
  ensDeploymentChain: ENSDeploymentChain,
  encodedLsl: EncodedLsl,
): ListStorageLocationContract {
  const slicedEncodedLsl = sliceEncodedLsl(encodedLsl);
  const efpChainIds = getEFPChainIds(ensDeploymentChain);
  const efpLslContractSchema = createEfpLslContractSchema(efpChainIds);

  const parsed = efpLslContractSchema.safeParse(slicedEncodedLsl);

  if (!parsed.success) {
    throw new Error(
      "Failed to decode the encoded List Storage Location contract object: \n" +
        prettifyError(parsed.error) +
        "\n",
    );
  }
  return parsed.data;
}

/**
 * Get a list of EFP Chain IDs for the ENS Deployment Chain.
 *
 * @param ensDeploymentChain
 * @returns list of EFP chain IDs
 */
export function getEFPChainIds(ensDeploymentChain: ENSDeploymentChain): bigint[] {
  switch (ensDeploymentChain) {
    case "mainnet":
      return [BigInt(base.id), BigInt(optimism.id), BigInt(mainnet.id)];
    case "sepolia":
      return [BigInt(baseSepolia.id), BigInt(optimismSepolia.id), BigInt(sepolia.id)];
    default:
      throw new Error(
        `LSL Chain IDs are not configured for ${ensDeploymentChain} ENS Deployment Chain`,
      );
  }
}

/**
 * Data structure used during parsing with {@link createEfpLslSchema} schema.
 */
interface EncodedListStorageLocation {
  /**
   * The version of the List Storage Location.
   *
   * Formatted as the string representation of a `uint8` value.
   * This is used to ensure compatibility and facilitate future upgrades.
   */
  version: string;

  /**
   * The type of the List Storage Location.
   *
   * Formatted as the string representation of a `uint8` value.
   * This identifies the kind of data the data field contains.
   */
  type: string;

  /**
   * 32-byte EVM chain ID of the chain where the EFP list records are stored.
   */
  chainId: string;

  /**
   * The 20-byte EVM address of the contract on chainId where the EFP list records are stored.
   */
  listRecordsAddress: string;

  /**
   * The 32-byte value that specifies the storage slot of the EFP list records within the listRecordsAddress contract.
   * This disambiguates multiple lists stored within the same contract and
   * de-couples it from the EFP List NFT token id which is stored on Ethereum and
   * inaccessible on L2s.
   */
  slot: string;
}

/**
 * Slice encoded LSL into a dictionary of LSL params.
 * @param encodedLsl
 * @returns {EncodedListStorageLocation} LSL params.
 * @throws {Error} when input param is not of expected length
 */
function sliceEncodedLsl(encodedLsl: string): EncodedListStorageLocation {
  if (encodedLsl.length !== 174) {
    throw new Error("Encoded List Storage Location values must be a 174-character long string");
  }

  return {
    // Extract the first byte after the 0x (2 hex characters = 1 byte)
    version: encodedLsl.slice(2, 4),

    // Extract the second byte
    type: encodedLsl.slice(4, 6),

    // Extract the next 32 bytes to get the chain id
    chainId: encodedLsl.slice(6, 70),

    // Extract the address (40 hex characters = 20 bytes)
    listRecordsAddress: encodedLsl.slice(70, 110),

    // Extract last 32 bytes to get the slot
    slot: encodedLsl.slice(110, 174),
  } satisfies EncodedListStorageLocation;
}

/**
 * Create a zod schema covering validations and invariants enforced with {@link decodeListStorageLocationContract} parser.
 * @param {bigint[]} efpChainIds List of IDs for chains that the EFP protocol has been present on.
 */
const createEfpLslContractSchema = (efpChainIds: bigint[]) =>
  z.object({
    version: z.literal("01").transform(() => ListStorageLocationVersion.V1),

    type: z.literal("01").transform(() => ListStorageLocationType.EVMContract),

    chainId: z
      .string()
      .length(64)
      .transform((v) => BigInt("0x" + v))
      // invariant: chainId is from one of the supported EFP deployment chains
      // https://docs.efp.app/production/deployments/
      .refine((v) => efpChainIds.includes(v), {
        message: `chainId must be one of the EFP Chain IDs: ${efpChainIds.join(", ")}`,
      }),

    listRecordsAddress: z
      .string()
      .length(40)
      .transform((v) => `0x${v}`)
      // ensure EVM address correctness and map it into lowercase for increased data model safety
      .transform((v) => getAddress(v).toLowerCase() as Address),

    slot: z
      .string()
      .length(64)
      .transform((v) => BigInt("0x" + v)),
  });

/**
 * Unique EFP List Storage Location ID (lowercase)
 *
 * Example:
 * `${chainId}-${listRecordsAddress}-${slot}-${type}-${version}`
 */
export type ListStorageLocationId = string;

/**
 * Makes a unique lowercase EFP List Storage Location ID.
 *
 * @param {ListStorageLocationContract} listStorageLocationContract a decoded List Storage Location Contract object
 * @returns a unique lowercase List Storage Location ID
 */
export const makeListStorageLocationId = ({
  chainId,
  listRecordsAddress,
  slot,
  type,
  version,
}: ListStorageLocationContract): ListStorageLocationId =>
  [
    chainId.toString(),
    listRecordsAddress.toLowerCase(),
    slot.toString(),
    type.toString(),
    version.toString(),
  ].join("-");
