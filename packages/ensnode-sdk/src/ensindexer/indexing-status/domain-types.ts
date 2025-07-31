import type { BlockRef, ChainId } from "../../shared";

export const ChainIndexingStatusIds = {
  NotStarted: "notStarted",
  Backfill: "backfill",
  Following: "following",
  Completed: "completed",
} as const;

/**
 * ChainIndexingStatusId is the derived string union of possible Chain Indexing Status identifiers.
 */
export type ChainIndexingStatusId =
  (typeof ChainIndexingStatusIds)[keyof typeof ChainIndexingStatusIds];

/**
 * Chain Indexing: Not started status
 *
 * Notes:
 * - The "notStarted" status applies when using omnichain ordering and the
 *   overall progress checkpoint has not reached the startBlock of the chain.
 */
export interface ChainIndexingNotStartedStatus<BlockRefType = BlockRef> {
  status: typeof ChainIndexingStatusIds.NotStarted;
  startBlock: BlockRefType;
}

/**
 * Chain Indexing: Backfill status
 *
 * Notes:
 * - The backfillEndBlock is the latest block when the process starts up.
 * - When latestIndexedBlock reaches backfillEndBlock, the backfill is complete
 *   and the status will change to "following" or "completed".
 *
 * Invariants:
 * - startBlock is always before or the same as latestIndexedBlock
 * - latestIndexedBlock is always before or the same as latestKnownBlock
 * - backfillEndBlock is always the same as latestKnownBlock
 */
export interface ChainIndexingBackfillStatus<BlockRefType = BlockRef> {
  status: typeof ChainIndexingStatusIds.Backfill;
  startBlock: BlockRefType;
  latestIndexedBlock: BlockRefType;
  latestKnownBlock: BlockRefType;
  backfillEndBlock: BlockRefType;
}

/**
 * Chain Indexing: Following status
 *
 * Invariants:
 * - startBlock is always before or the same as latestIndexedBlock
 * - latestIndexedBlock is always before or the same as latestKnownBlock
 * - approximateRealtimeDistance is always a non-negative integer value holding a duration
 */
export interface ChainIndexingFollowingStatus<BlockRefType = BlockRef> {
  status: typeof ChainIndexingStatusIds.Following;
  startBlock: BlockRefType;
  latestIndexedBlock: BlockRefType;
  latestKnownBlock: BlockRefType;
  approximateRealtimeDistance: number;
}

/**
 * Chain Indexing: Completed status
 *
 * Notes:
 * - The "completed" status only applies when all contracts, accounts, and block intervals
 *   have a defined endBlock. This means the chain will not enter the "following" status.
 *
 * Invariants:
 * - startBlock is always before or the same as latestIndexedBlock
 * - latestIndexedBlock is always the same as latestKnownBlock
 */
export interface ChainIndexingCompletedStatus<BlockRefType = BlockRef> {
  status: typeof ChainIndexingStatusIds.Completed;
  startBlock: BlockRefType;
  latestIndexedBlock: BlockRefType;
  latestKnownBlock: BlockRefType;
}

/**
 * Chain Indexing Status
 *
 * Chain Indexing is guaranteed to be always in exactly one of the statuses defined with `ChainIndexingStatus` type.
 */
export type ChainIndexingStatus<BlockRefType = BlockRef> =
  | ChainIndexingNotStartedStatus<BlockRefType>
  | ChainIndexingBackfillStatus<BlockRefType>
  | ChainIndexingFollowingStatus<BlockRefType>
  | ChainIndexingCompletedStatus<BlockRefType>;

/**
 * Chain Indexing Statuses
 *
 * {@link ChainIndexingStatus} per chain.
 */
export type ChainIndexingStatuses = Map<ChainId, ChainIndexingStatus>;

/**
 * ENSIndexer Indexing Status
 *
 * Describes the current state of the indexing operations across indexed chains.
 */
export interface ENSIndexerIndexingStatus {
  chains: ChainIndexingStatuses;
}
