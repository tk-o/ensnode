import type { ChainId, NormalizedAddress } from "enssdk";
import type { Hash, PublicClient } from "viem";

import type { ENSNamespaceId } from "@ensnode/datasources";
import type { EnsRainbowApiClient } from "@ensnode/ensrainbow-sdk";

/**
 * A block as seen by an indexing engine.
 */
export interface IndexingEngineBlock {
  number: bigint;
  timestamp: bigint;
  hash: Hash;
}

/**
 * A transaction as seen by an indexing engine.
 */
export interface IndexingEngineTransaction {
  hash: Hash;
  from: NormalizedAddress;
  to?: NormalizedAddress;
  transactionIndex: number;
}

/**
 * A log as seen by an indexing engine.
 */
export interface IndexingEngineLog {
  address: NormalizedAddress;
  logIndex: number;
  topics: [Hash, ...Hash[]];
  data: Hash;
}

/**
 * An onchain event as seen by an indexing engine.
 *
 * The `args` type parameter can be used to type the decoded event arguments.
 */
export interface IndexingEngineEvent<Args = unknown> {
  id: string;
  args: Args;
  block: IndexingEngineBlock;
  transaction: IndexingEngineTransaction;
  log: IndexingEngineLog;
}

/**
 * Convenience type for an event whose arguments are explicitly typed.
 */
export type EventWithArgs<Args extends Record<string, unknown> = {}> = IndexingEngineEvent<Args>;

/**
 * An event without decoded arguments. Useful for helpers that only need
 * block/transaction/log metadata.
 */
export type LogEventBase = Omit<IndexingEngineEvent, "args">;

/**
 * Builder returned by {@link EnsDbStore.insert}.
 */
export interface EnsDbInsertBuilder<TTable = unknown> {
  values(value: any): EnsDbInsertBuilder<TTable>;
  onConflictDoUpdate(values: any): Promise<any>;
  onConflictDoUpdate(options: { target: any; set: any }): Promise<any>;
  onConflictDoNothing(): Promise<any>;
}

/**
 * Builder returned by {@link EnsDbStore.update}.
 */
export interface EnsDbUpdateBuilder<_TTable = unknown> {
  set(values: Record<string, unknown>): Promise<void>;
  set(values: (row: any) => Record<string, unknown>): Promise<void>;
}

/**
 * Engine-agnostic ENSDb Store API.
 *
 * Modeled after the subset of Ponder's Store API used by the indexing handlers.
 * Other indexing engines can implement this interface to reuse the handlers.
 *
 * NOTE: the API surface intentionally uses `any` for row/set values so that the
 * package does not need a direct dependency on Ponder's precise Store types.
 * A Ponder-based adapter delegates straight to `ponderContext.db`, which satisfies
 * this shape at runtime.
 */
export interface EnsDbStore {
  /**
   * Find a single row by primary key.
   */
  find<TTable>(table: TTable, key: Record<string, unknown>): Promise<any>;

  /**
   * Insert one or more rows.
   */
  insert<TTable>(table: TTable): EnsDbInsertBuilder<TTable>;

  /**
   * Update a row by primary key.
   */
  update<TTable>(table: TTable, key: Record<string, unknown>): EnsDbUpdateBuilder<TTable>;

  /**
   * Delete a row by primary key.
   */
  delete<TTable>(table: TTable, key: Record<string, unknown>): Promise<void>;

  /**
   * Raw SQL/Drizzle access. Ponder exposes a Drizzle client here; other engines may
   * expose a compatible subset.
   */
  sql: any;
}

/**
 * Minimal logger interface exposed on the indexing context.
 */
export interface IndexingEngineLogger {
  info(message: Record<string, unknown>): void;
  warn(message: Record<string, unknown>): void;
  error(message: Record<string, unknown>): void;
  debug(message: Record<string, unknown>): void;
}

/**
 * Context passed to every indexing event handler by an indexing engine.
 *
 * This is intentionally engine-agnostic: it does not expose any Ponder-specific
 * types, so the same handlers can run on Ponder or on a different indexing engine
 * that implements {@link EnsDbStore}.
 */
export interface IndexingEngineContext {
  /**
   * The chain on which the current event was emitted.
   */
  chain: {
    id: ChainId;
  };

  /**
   * A Viem public client for the current chain. Indexing engines that do not
   * provide RPC access can expose a minimal subset of {@link PublicClient}.
   */
  client: PublicClient;

  /**
   * Indexed contract metadata keyed by namespaced contract name.
   *
   * Provided by engines that expose contract ABI/address info (e.g. Ponder).
   * Engines that do not provide this can leave it as an empty record.
   */
  contracts: Record<
    string,
    {
      abi: any;
      address?: NormalizedAddress | NormalizedAddress[];
    }
  >;

  /**
   * Store API for ENSDb.
   */
  ensDb: EnsDbStore;

  /**
   * ENSRainbow client used for label healing.
   */
  ensRainbow: EnsRainbowApiClient;

  /**
   * Structured logger for indexing diagnostics.
   */
  logger: IndexingEngineLogger;

  /**
   * The ENS namespace being indexed.
   */
  namespace: ENSNamespaceId;

  /**
   * Whether the indexer is running in Subgraph-compatible mode.
   */
  isSubgraphCompatible: boolean;
}
