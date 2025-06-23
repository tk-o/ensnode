/**
 * Database schema definitions for indexed EFP entities.
 */

import { onchainTable, relations } from "ponder";

/**
 * EFP List Token
 *
 * An onchain ERC-721A NFT representing an EFP list minted with the EFPListRegistry contract.
 */
export const efp_listToken = onchainTable("efp_list_token", (p) => ({
  /**
   * EFP List Token ID
   *
   * The ID of the ERC-721A NFT representing an EFP list minted with the EFPListRegistry contract.
   */
  id: p.bigint().primaryKey(),

  /**
   * Owner address
   *
   * The address of the current owner of the EFP List Token.
   */
  owner: p.hex().notNull(),
}));

/**
 * EFP List Storage Location
 *
 * @link https://docs.efp.app/design/list-storage-location/#onchain-storage
 */
export const efp_listStorageLocation = onchainTable("efp_list_storage_location", (p) => ({
  /**
   * ListStorageLocation ID
   *
   * Value of `EncodedLsl` type.
   */
  id: p.hex().primaryKey(),

  /**
   * EVM chain ID of the chain where the EFP list records are stored.
   *
   * This value is of `EFPDeploymentChainId` type which currently fits in the range of 1 to 2^53-1.
   * The 16 digits of precision is sufficient to represent all possible chain IDs.
   */
  chainId: p.numeric({ mode: "number", precision: 16, scale: 0 }).notNull(),

  /**
   * Contract address on chainId where the EFP list records are stored.
   */
  listRecordsAddress: p.hex().notNull(),

  /**
   * Slot
   *
   * 32-byte value that specifies the storage slot of the EFP list records within the listRecordsAddress contract.
   * This disambiguates multiple lists stored within the same contract and
   * de-couples it from the EFP List NFT token id which is stored on the EFP deployment root chain and
   * inaccessible on other chains.
   */
  slot: p.bigint().notNull(),

  /**
   * EFP List Token ID
   *
   * Foreign key to the associated EFP List Token.
   */
  listTokenId: p.bigint().notNull(),
}));

/**
 * EFP Unrecognized List Storage Location
 *
 * Used to store EFP List Storage Locations that were not recognized or could not be decoded.
 */
export const efp_unrecognizedListStorageLocation = onchainTable(
  "efp_list_storage_location_unrecognized",
  (p) => ({
    /**
     * ListStorageLocation ID
     *
     * Value of `EncodedLsl` type.
     */
    id: p.hex().primaryKey(),

    /**
     * EFP List Token ID
     *
     * Foreign key to the associated EFP List Token.
     */
    listTokenId: p.bigint().notNull(),
  }),
);

// Define relationship between the "List Token" and the "List Storage Location" entities
// Each List Token has zero-to-one List Storage Location.
// If zero it means the associated List Storage Location was never created or incorrectly formatted.
// Note: If the List Storage Location was created, but was not recognized,
// it would be stored in the `efp_unrecognizedListStorageLocation` schema.
// The List Storage Location would not be created for any of batch minted List Tokens:
// - https://github.com/ethereumfollowprotocol/contracts/blob/e8d2f5c/src/EFPListRegistry.sol#L281
// - https://github.com/ethereumfollowprotocol/contracts/blob/e8d2f5c/src/EFPListRegistry.sol#L294
export const efp_listTokenRelations = relations(efp_listToken, ({ one }) => ({
  listStorageLocation: one(efp_listStorageLocation, {
    fields: [efp_listToken.id],
    references: [efp_listStorageLocation.listTokenId],
  }),
}));

// Define relationship between the "List Storage Location" and the "List Token" entities
// Each List Storage Location is associated with exactly one List Token.
export const efp_listStorageLocationRelations = relations(efp_listStorageLocation, ({ one }) => ({
  listToken: one(efp_listToken, {
    fields: [efp_listStorageLocation.listTokenId],
    references: [efp_listToken.id],
  }),
}));

// Define relationship between the "Unrecognized List Storage Location" and the "List Token" entities
// Each Unrecognized List Storage Location is associated with exactly one List Token.
export const efp_unrecognizedListStorageLocationRelations = relations(
  efp_unrecognizedListStorageLocation,
  ({ one }) => ({
    listToken: one(efp_listToken, {
      fields: [efp_unrecognizedListStorageLocation.listTokenId],
      references: [efp_listToken.id],
    }),
  }),
);
