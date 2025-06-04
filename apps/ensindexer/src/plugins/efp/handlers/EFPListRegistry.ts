import { ponder } from "ponder:registry";
import { efp_listStorageLocation, efp_listToken } from "ponder:schema";

import config from "@/config";
import type { ENSIndexerPluginHandlerArgs } from "@/lib/plugin-helpers";
import { DatasourceName } from "@ensnode/ens-deployments";
import { PluginName } from "@ensnode/ensnode-sdk";
import { zeroAddress } from "viem";
import type { Address } from "viem/accounts";
import { getAddress } from "viem/utils";

const efpListRegistryContract =
  config.ensDeployment[DatasourceName.EFPBase].contracts["EFPListRegistry"];

export default function ({ namespace }: ENSIndexerPluginHandlerArgs<PluginName.EFP>) {
  ///
  /// EFPListRegistry Handlers
  ///
  ponder.on(
    namespace("EFPListRegistry:Transfer"),
    async function handleListTokenMint({ context, event }) {
      // We can only index a new List Token after a mint event happened.
      // This means  the `from` address of the Transfer event points to
      // the zero address. Otherwise, we skip event handling
      if (event.args.from !== zeroAddress) {
        return;
      }

      // As this is a token mint event, create a new List Token with an owner
      const listToken = await context.db.insert(efp_listToken).values({
        id: event.args.tokenId,
        ownerAddress: event.args.to,
      });

      // Read the List Storage Location for that newly created List Token
      const listStorageLocationRaw = await context.client.readContract({
        abi: efpListRegistryContract.abi,
        address: efpListRegistryContract.address,
        functionName: "getListStorageLocation",
        args: [listToken.id],
      });

      // Index the List Storage Location linked to the List Token
      try {
        const parsedListStorageLocation = parseListStorageLocation(listStorageLocationRaw);

        // Index the parsed List Storage Location data with a reference to the List Token
        // created with the currently handled EVM event
        await context.db
          .insert(efp_listStorageLocation)
          .values({
            ...parsedListStorageLocation,
            listTokenId: listToken.id,
          })
          // TODO: decide what needs to do in a case of violated unique constraint
          // For example, it happens for List Storage Location fetched after
          // this transaction
          // https://basescan.org/tx/0x5f64037fedd56a3a874f598a38a48ea6f8f5f9815223dac955e2c18eff1ab173
          //
          // NOTE: For now, we do update the reference to the List Token
          .onConflictDoUpdate({
            listTokenId: listToken.id,
          });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        console.error(
          `Could not create list storage location for tx ${event.transaction.hash}. Error: ${errorMessage}`,
        );
      }
    },
  );
}

// NOTE: copied from https://github.com/ethereumfollowprotocol/onchain/blob/f3c970e/src/efp.ts#L95-L123
/**
 * Parses a List Storage Location string and returns a ListStorageLocation object.
 *
 * @param lsl - The List Storage Location string to parse.
 * @throws An error if parsing could not be completed successfully.
 * @returns A {@link ListStorageLocation} object with parsed data.
 */
export function parseListStorageLocation(lsl: string): ListStorageLocation {
  if (lsl.length != 174) {
    throw new Error("List Storage Location value must be 174-character long string");
  }

  const lslVersion = lsl.slice(2, 4); // Extract the first byte after the 0x (2 hex characters = 1 byte)
  const lslType = lsl.slice(4, 6); // Extract the second byte
  const lslChainId = BigInt("0x" + lsl.slice(6, 70)); // Extract the next 32 bytes to get the chain id
  // NOTE: updated parser
  const lslListRecordsContract = getAddress("0x" + lsl.slice(70, 110)); // Extract the address (40 hex characters = 20 bytes)
  const lslSlot = BigInt("0x" + lsl.slice(110, 174)); // Extract the slot
  return {
    version: lslVersion,
    type: lslType,
    chainId: lslChainId,
    listRecordsAddress: lslListRecordsContract,
    slot: lslSlot,
  };
}

// NOTE: copied from https://github.com/ethereumfollowprotocol/onchain/blob/598ab49/src/types.ts#L41-L47
// Documented based on https://docs.efp.app/design/list-storage-location/
/**
 * List Storage Location is encoded in a versioned, flexible data structure.
 *
 * Each List Storage Location is encoded as a bytes array with the following structure:
 * - `version`: A uint8 representing the version of the List Storage Location. This is used to ensure compatibility and facilitate future upgrades.
 * - `location_type`: A uint8 indicating the type of list storage location. This serves as an identifier for the kind of data the data field contains.
 * - `data:` A bytes array containing the actual data of the list storage location. The structure of this data depends on the location type.
 *
 * The version is always 1.
 * The location type is always 1.
 */
type ListStorageLocation = {
  /**
   * A `uint8` representing the version of the List Storage Location.
   * This is used to ensure compatibility and facilitate future upgrades.
   */
  version: string;

  /**
   * A uint8 indicating the type of list storage location.
   * This serves as an identifier for the kind of data the data field contains.
   */
  type: string;

  /**
   * The 32-byte EVM chain ID of the chain where the list is stored.
   * A.k.a. `chain_id`
   */
  chainId: bigint;

  /**
   * The 20-byte EVM address of the contract where the list is stored.
   * A.k.a. `contract_address`
   *
   * NOTE: updated type from `string` to `Address`
   */
  listRecordsAddress: Address;

  /**
   * A 32-byte value that specifies the storage slot of the list within the contract.
   * This disambiguates multiple lists stored within the same contract and
   * de-couples it from the EFP List NFT token id which is stored on Ethereum and
   * inaccessible on L2s.
   */
  slot: bigint;
};
