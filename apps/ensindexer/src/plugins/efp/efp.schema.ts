/**
 * Schema Definitions for optional EFP protocol entities.
 */

import { onchainTable } from "ponder";

// NOTE: this schema type is based on information from
// https://docs.efp.app/production/interpreting-state/
export const efpListStorageLocation = onchainTable("efp_list_storage_location", (p) => ({
  // list token ID —
  tokenId: p.bigint().primaryKey(),
  chainId: p.bigint().notNull(),
  listRecordsAddress: p.hex().notNull(),
  slot: p.bigint().notNull(),
}));
