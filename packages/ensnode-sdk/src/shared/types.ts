/**
 * Chain ID
 *
 * Represents a unique identifier for a chain.
 * Guaranteed to be a non-negative integer.
 **/
export type ChainId = number;

/**
 * Block Number
 *
 * Guaranteed to be a non-negative integer.
 */
export type BlockNumber = number;

/**
 * Datetime value
 */
export type Datetime = Date;

/**
 * Represents a URL that is used for RPC endpoints.
 *
 * Invariants:
 * - The URL must be a valid URL (localhost urls are allowed)
 */
export type RpcUrl = URL;

/**
 * BlockRef
 *
 * Describes a block.
 *
 * We use parameter types to maintain fields layout and documentation across
 * the domain model and its serialized counterpart.
 */
export interface BlockRef<DatetimeType = Datetime> {
  /** Block number (height) */
  number: BlockNumber;

  /** Block creation datetime */
  createdAt: DatetimeType;
}

/**
 * Block range
 *
 * Represents a range of blocks
 */
export interface Blockrange<BlockType = BlockNumber> {
  /** Start block number */
  startBlock?: BlockType;

  /** End block number */
  endBlock?: BlockType;
}

/**
 * Duration
 *
 * Representing a duration in seconds.
 *
 * Guaranteed to be a non-negative integer.
 */
export type Duration = number;
