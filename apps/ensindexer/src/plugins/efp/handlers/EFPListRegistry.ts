import { ponder } from "ponder:registry";
import { efpListStorageLocation } from "ponder:schema";

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
      const { tokenId, from } = event.args;

      if (from !== zeroAddress) {
        // this is not a token mint transaction
        return;
      }

      const listStorageLocationRaw = await context.client.readContract({
        abi: efpListRegistryContract.abi,
        address: efpListRegistryContract.address,
        functionName: "getListStorageLocation",
        args: [tokenId],
      });

      try {
        const { version, type, chainId, listRecordsContract, slot } =
          parseListStorageLocation(listStorageLocationRaw);

        await context.db.insert(efpListStorageLocation).values({
          chainId,
          tokenId,
          listRecordsAddress: listRecordsContract,
          slot,
          version,
          type,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        console.error(
          `Could not update list storage location for tx ${event.transaction.hash}. Error: ${errorMessage}`,
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
 * @returns A ListStorageLocation object with parsed data.
 */
export function parseListStorageLocation(lsl: string): ListStorageLocation {
  if (lsl.length < 174) {
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
    listRecordsContract: lslListRecordsContract,
    slot: lslSlot,
  };
}

// NOTE: copied from https://github.com/ethereumfollowprotocol/onchain/blob/598ab49/src/types.ts#L41-L47
type ListStorageLocation = {
  version: string;
  type: string;
  chainId: bigint;
  // NOTE: updated type
  listRecordsContract: Address;
  slot: bigint;
};
