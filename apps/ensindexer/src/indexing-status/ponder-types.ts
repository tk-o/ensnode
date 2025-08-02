import { BlockRef, Blockrange, ChainId } from "@ensnode/ensnode-sdk";
import type { AddressConfig, ChainConfig, CreateConfigReturnType } from "ponder";
import type { PublicClient } from "viem";

export type ChainName = string;

export type PonderBlockNumber = number | "latest";

export type PonderBlockrange = Blockrange<PonderBlockNumber>;

export type PonderBlockRef = {
  number: number;
  timestamp: number;
};

/**
 * Ponder config datasource with a flat `chain` value.
 */
export type PonderConfigDatasourceFlat = {
  chain: ChainName;
} & AddressConfig &
  Blockrange;

/**
 * Ponder config datasource with a nested `chain` value.
 */
export type PonderConfigDatasourceNested = {
  chain: Record<ChainName, AddressConfig & PonderBlockrange>;
};

/**
 * Ponder Config Datasource ID
 *
 * @see https://ponder.sh/docs/api-reference/ponder/config#accounts
 * @see https://ponder.sh/docs/api-reference/ponder/config#blocks
 * @see https://ponder.sh/docs/api-reference/ponder/config#contracts
 */
type PonderConfigDatasourceId = "accounts" | "blocks" | "contracts";

/**
 * Ponder config datasource
 */
export type PonderConfigDatasource = PonderConfigDatasourceFlat | PonderConfigDatasourceNested;

/**
 * Ponder config datasource
 */
type PonderConfigDatasources = {
  [datasourceId: string]: PonderConfigDatasource;
};

/**
 * Ponder chains config
 *
 * Chain config for each indexed chain.
 */
type PonderConfigChains = {
  [chainName: ChainName]: ChainConfig;
};

/**
 * Ponder Config
 *
 * A utility type describing Ponder Config.
 */
export type PonderConfigType = CreateConfigReturnType<
  PonderConfigChains,
  PonderConfigDatasources,
  PonderConfigDatasources,
  PonderConfigDatasources
>;

/**
 * Ponder PublicClients
 *
 * Public (RPC) client for each indexed chain.
 */
export type PonderPublicClients = Record<ChainName, PublicClient>;

/**
 * Ponder Chain Status
 */
export type PonderChainStatus = {
  /**
   * Indexed chain ID
   *
   * Guaranteed to be a non-negative integer.
   **/
  id: ChainId;

  /**
   * Indexed chain status block
   *
   * Either:
   * - the first block to be indexed, if the chain indexing has not started yet,
   * - the latest indexed block, if the chain has been already indexed.
   */
  block: PonderBlockRef;
};

/**
 * Ponder Chain Block Refs
 *
 * Represents information about indexing scope for an indexed chain.
 */
export type PonderChainBlockRefs = {
  /**
   * Based on Ponder Configuration
   */
  config: {
    startBlock: PonderBlockRef;

    endBlock: PonderBlockRef | null;
  };

  /**
   * Based on Ponder runtime metrics
   */
  backfillEndBlock: PonderBlockRef;
};

export interface PonderChainStatusFromResponse {
  chainId: number | undefined;
  block: Partial<PonderBlockRef>;
}

export interface PonderChainMetricsFromResponse {
  ordering: string | undefined;
  command: string | undefined;

  historicalCompletedBlocks: number | undefined;
  historicalCachedBlocks: number | undefined;
  historicalTotalBlocks: number | undefined;
  isSyncComplete: number | undefined;
  isSyncRealtime: number | undefined;
  syncBlock: Partial<PonderBlockRef>;
}

export interface PonderChainMetrics {
  ordering: "omnichain";
  command: "dev" | "start";

  historicalCompletedBlocks: number;
  historicalTotalBlocks: number;
  isSyncComplete: boolean;
  isSyncRealtime: boolean;
  syncBlock: BlockRef;
}
