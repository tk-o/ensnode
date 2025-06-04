/**
 * Schema Definitions for optional EFP protocol entities.
 */

import { onchainTable } from "ponder";

// NOTE: this schema type is based on information from
// https://docs.efp.app/production/interpreting-state/
export const efpListStorageLocation = onchainTable("efp_list_storage_location", (p) => ({
  // List ID
  tokenId: p.bigint().primaryKey(),

  // EVM chain ID of the chain where the list is stored
  chainId: p.bigint().notNull(),

  // EVM address of the contract where the list is stored
  listRecordsAddress: p.hex().notNull(),

  // Specifies the storage slot of the list within the contract
  slot: p.bigint().notNull(),
}));
