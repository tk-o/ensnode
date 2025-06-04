/**
 * Schema Definitions for optional EFP protocol entities.
 */

import { onchainTable, primaryKey, relations } from "ponder";

/**
 * EFP List Token
 *
 * Represents an onchain owned token minted with EFPListRegistry contract.
 */
export const efp_listToken = onchainTable("efp_list_token", (p) => ({
  /**
   * List Token ID
   *
   * It's an ID of ERC-721A token minted with EFPListRegistry contract.
   * It's a very important value as it enables
   * `getListStorageLocation(tokenId)` call on the EFPListRegistry contract,
   * which result allows querying data for related list records.
   */
  id: p.bigint().primaryKey(),

  /**
   * Owner address
   *
   * An address of the current owner of the EFP List Token.
   */
  ownerAddress: p.hex().notNull(),
}));

/**
 * EFP List Storage Location
 *
 * @link https://docs.efp.app/design/list-storage-location/#onchain-storage
 */
export const efp_listStorageLocation = onchainTable(
  "efp_list_storage_location",
  (p) => ({
    /**
     * Chain ID
     *
     * The 32-byte EVM chain ID of the chain where the list is stored.
     */
    chainId: p.bigint().notNull(),

    /**
     * List records contract address
     *
     * The 20-byte EVM address of the contract where the list is stored.
     */
    listRecordsAddress: p.hex().notNull(),

    /**
     * Slot
     *
     * A 32-byte value that specifies the storage slot of the list within the contract.
     * This disambiguates multiple lists stored within the same contract and
     * de-couples it from the EFP List NFT token id which is stored on Ethereum
     * and inaccessible on L2s.
     */
    slot: p.bigint().notNull(),

    /**
     * List Token ID
     *
     * A reference to EFP List Token entity.
     */
    listTokenId: p.bigint().notNull(),
  }),
  (table) => ({
    /**
     * An EFP Storage Location can be uniquely specified via three pieces of data:
     *   - `chain_id` (which is the `chainId` in the schema)
     *   - `contract_address` (which is the `listRecordsAddress` in the schema)
     *   - `slot`
     */
    pk: primaryKey({ columns: [table.chainId, table.listRecordsAddress, table.slot] }),
  }),
);

// Define relationship between the "List Token" and the "List Storage Location" entities
// One List Token has exactly one List Storage Location.
export const efp_listTokenRelations = relations(efp_listToken, ({ one }) => ({
  listStorageLocation: one(efp_listStorageLocation, {
    fields: [efp_listToken.id],
    references: [efp_listStorageLocation.listTokenId],
  }),
}));

// Define relationship between the "List Storage Location" and the "List Token" entities
// One List Storage Location has exactly one List Token.
export const efp_listStorageLocationRelations = relations(efp_listStorageLocation, ({ one }) => ({
  listToken: one(efp_listToken, {
    fields: [efp_listStorageLocation.listTokenId],
    references: [efp_listToken.id],
  }),
}));
