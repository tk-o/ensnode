import { ponder } from "ponder:registry";
import {
  efp_listStorageLocation,
  efp_listToken,
  efp_unrecognizedListStorageLocation,
} from "ponder:schema";

import config from "@/config";
import type { ENSIndexerPluginHandlerArgs } from "@/lib/plugin-helpers";
import { PluginName } from "@ensnode/ensnode-sdk";
import { zeroAddress } from "viem";
import { type ListStorageLocationContract, decodeListStorageLocationContract } from "../lib/lsl";

export default function ({ pluginNamespace: ns }: ENSIndexerPluginHandlerArgs<PluginName.EFP>) {
  ///
  /// EFPListRegistry Handlers
  ///
  ponder.on(
    ns("EFPListRegistry:Transfer"),
    async function handleEFPListTokenTransfer({ context, event }) {
      const { tokenId, from: fromAddress, to: toAddress } = event.args;

      // The mint event represents the transfer of ownership of
      // a token from the zeroAddress to the new owner's address.
      if (fromAddress === zeroAddress) {
        // Create a new List Token with the owner initialized as the token recipient
        await context.db.insert(efp_listToken).values({
          id: tokenId,
          owner: toAddress,
        });
      }

      // The burn event represents the transfer of ownership of
      // a token from the owner's address to the zero address.
      else if (toAddress === zeroAddress) {
        // Delete the burnt EFP List Token
        await context.db.delete(efp_listToken, { id: tokenId });
      }

      // If the transfer is not from the zeroAddress,
      // and the transfer is not to the zeroAddress,
      // this transfer represents an ownership change.
      else {
        // Update the owner of the the List Token that changed ownership
        await context.db.update(efp_listToken, { id: tokenId }).set({
          owner: toAddress,
        });
      }
    },
  );

  ponder.on(
    ns("EFPListRegistry:UpdateListStorageLocation"),
    async function handleEFPListStorageLocationUpdate({ context, event }) {
      const { listStorageLocation: encodedListStorageLocation, tokenId } = event.args;
      const listToken = await context.db.find(efp_listToken, { id: tokenId });

      // invariant: List Token must exist before its List Storage Location can be updated
      if (!listToken) {
        throw new Error(
          `Cannot update List Storage Location for nonexisting List Token (id: ${tokenId})`,
        );
      }

      const lslId = encodedListStorageLocation;
      let lslContract: ListStorageLocationContract | undefined;

      // Update the List Storage Location associated with the List Token
      try {
        lslContract = decodeListStorageLocationContract(
          config.namespace,
          encodedListStorageLocation,
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(
          `Could not decode the V1 EVMContract List storage Location for tx "${event.transaction.hash}" on chain with ID "${context.network.chainId}". Error: ${errorMessage}.`,
        );
      }

      // was V1 EVMContract LSL decoded successfully?
      if (lslContract) {
        // Index the decoded List Storage Location data with a reference to the List Token
        // created with the currently handled EVM event
        await context.db
          .insert(efp_listStorageLocation)
          .values({
            id: lslId,
            listTokenId: listToken.id,
            chainId: lslContract.chainId,
            listRecordsAddress: lslContract.listRecordsAddress,
            slot: lslContract.slot,
          })
          // TODO: decide what needs to be done in the case of a violated unique constraint.
          // There can be only one LSL entity with a unique tuple of values
          // (version, type, chainId, listRecordsAddress, slot).
          // In case we try inserting a duplicate of the existing LSL entity,
          // we will get the unique constraint violation error.
          // For example, it happens for List Storage Location fetched after
          // this transaction
          // https://basescan.org/tx/0x5f64037fedd56a3a874f598a38a48ea6f8f5f9815223dac955e2c18eff1ab173
          //
          // Can the same tuple of (version, type, chainId, listRecordsAddress, slot) value be linked with different tokenIds?
          //
          // NOTE: For now, we do update the reference for the List Token
          .onConflictDoUpdate({
            listTokenId: listToken.id,
          });
      } else {
        // Even if the List Storage Location could not be decoded,
        // we still want to store the encoded LSL value.
        await context.db
          .insert(efp_unrecognizedListStorageLocation)
          .values({
            id: lslId,
            listTokenId: listToken.id,
          })
          // Can the same tuple of (version, type, chainId, listRecordsAddress, slot) value be linked with different tokenIds?
          //
          // NOTE: For now, we do update the reference for the List Token
          .onConflictDoUpdate({
            listTokenId: listToken.id,
          });
      }
    },
  );
}
