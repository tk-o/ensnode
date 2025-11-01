import type { Address, Hash } from "viem";

import type { DEFAULT_EVM_CHAIN_ID } from "../ens";

/**
 * Chain ID
 *
 * Represents a unique identifier for a chain.
 * Guaranteed to be a positive integer.
 **/
export type ChainId = number;

/**
 * Defaultable Chain ID
 *
 * Represents a unique identifier for a chain, or
 * the default chain as defined by ENSIP-19.
 *
 * @see https://docs.ens.domains/ensip/19/#annex-supported-chains
 *
 * Guaranteed to be a non-negative integer.
 **/
export type DefaultableChainId = typeof DEFAULT_EVM_CHAIN_ID | ChainId;

/**
 * Represents an account (contract or EOA) at `address` on chain `chainId`.
 *
 * @see https://chainagnostic.org/CAIPs/caip-10
 */
export interface AccountId {
  chainId: ChainId;
  address: Address;
}

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
 * Unix timestamp value
 *
 * Represents the number of seconds that have elapsed
 * since January 1, 1970 (midnight UTC/GMT).
 *
 * Guaranteed to be an integer. May be zero or negative to represent a time at or
 * before Jan 1, 1970.
 */
export type UnixTimestamp = number;

/**
 * Represents a URL that is used for RPC endpoints.
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
export interface BlockRef {
  /** Block number (height) */
  number: BlockNumber;

  /** Block timestamp */
  timestamp: UnixTimestamp;
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
 * Event ID
 *
 * A globally unique identifier of a single indexed event.
 */
export type EventId = string;

/**
 * EventRef
 *
 * References a distinct onchain event.
 */
export interface EventRef<EventNameType extends string> {
  /**
   * Event ID
   *
   * A globally unique identifier of the indexed event.
   */
  id: EventId;

  /**
   * Event Name
   */
  name: EventNameType;

  /**
   * Chain ID
   *
   * Chain ID where the event occurred.
   */
  chainId: ChainId;

  /**
   * Block
   *
   * Reference to the block which includes the event log on `chainId` chain.
   */
  block: BlockRef;

  /**
   * Contract address
   *
   * Address of the contract that emitted the event on `chainId` chain.
   */
  contractAddress: Address;

  /**
   * Transaction Hash
   *
   * Hash of the transaction on `chainId` chain where the event occurred.
   *
   * Guaranteed to be a hex string representation of 32-bytes.
   */
  transactionHash: Hash;

  /**
   * Log Index
   *
   * Index of the event log within the block on `chainId` where the event occurred.
   *
   * Guaranteed to be a non-negative integer.
   */
  logIndex: number;
}

/**
 * Duration
 *
 * Representing a duration in seconds.
 *
 * Guaranteed to be a non-negative integer.
 */
export type Duration = number;

/**
 * A utility type that makes all properties of a type optional recursively,
 * including nested objects and arrays.
 *
 * @example
 * ```typescript
 * type Config = {
 *   a: string;
 *   b: {
 *     x: number;
 *     y: { z: boolean };
 *   };
 *   c: { id: string }[];
 * }
 *
 * type PartialConfig = DeepPartial<Config>;
 * // Results in:
 * // {
 * //   a?: string;
 * //   b?: {
 * //     x?: number;
 * //     y?: { z?: boolean };
 * //   };
 * //   c?: { id?: string }[];
 * // }
 *
 * // Usage:
 * const update: PartialConfig = { b: { y: { z: true } } };
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};
