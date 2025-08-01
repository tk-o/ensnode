import type { AddressConfig, ChainConfig, CreateConfigReturnType } from "ponder";
import type { PublicClient } from "viem";

export type ChainId = number;

export type PonderBlock = number | "latest";

type PonderBlocks = {
  startBlock?: PonderBlock;
  endBlock?: PonderBlock;
};

export type ChainName = string;

export type PonderConfigDatasourceFlat = {
  chain: ChainName;
} & AddressConfig &
  PonderBlocks;

export type PonderConfigDatasourceNested = {
  chain: Record<ChainName, AddressConfig & PonderBlocks>;
};

export type PonderConfigDatasource = PonderConfigDatasourceFlat | PonderConfigDatasourceNested;

type PonderConfigDatasources = {
  [datasourceName: string]: PonderConfigDatasource;
};

type PonderConfigChains = {
  [chainName: ChainName]: ChainConfig;
};

export type PonderConfigType = CreateConfigReturnType<
  PonderConfigChains,
  PonderConfigDatasources,
  PonderConfigDatasources,
  PonderConfigDatasources
>;

export type PonderPublicClients = { [chainName: ChainName]: PublicClient };

export type BlockRef = { number: number; timestamp: number };

export type PonderIndexedChain = {
  id: ChainId;
  startBlock: BlockRef;
  endBlock: BlockRef | null;
};

export type PonderIndexedChains = { [chainName: ChainName]: PonderIndexedChain };

export type IndexedChainBlockRefs = {
  chainId?: ChainId;
  startBlock: BlockRef;
  endBlock: BlockRef | null;
  backfillEndBlock?: BlockRef;
};

export type IndexedChainsBlockRefs = Record<ChainName, IndexedChainBlockRefs>;

export type ChainIndexingStatus =
  /**
   * Not started
   *
   * Notes:
   * - The "not_started" status applies when using omnichain ordering and the
   *   overall progress checkpoint has not reached the startBlock of the chain.
   */
  | {
      status: "not_started";
      config: { startBlock: BlockRef; endBlock: BlockRef | null };
    }
  /**
   * Backfill
   *
   * Notes:
   * - The backfillEndBlock is the latest block when the process starts up.
   * - When latestIndexedBlock reaches backfillEndBlock, the backfill is complete
   *   and the status will change to "following" or "completed".
   *
   * Invariants:
   * - latestIndexedBlock is always before or the same as latestKnownBlock
   * - backfillEndBlock is always the same as latestKnownBlock
   */
  | {
      status: "backfill";
      config: { startBlock: BlockRef; endBlock: BlockRef | null };
      latestIndexedBlock: BlockRef;
      latestKnownBlock: BlockRef;
      backfillEndBlock: BlockRef;
    }
  /**
   * Following
   *
   * Invariants:
   * - latestIndexedBlock is always before or the same as latestKnownBlock
   */
  | {
      status: "following";
      config: { startBlock: BlockRef; endBlock: BlockRef | null };
      latestIndexedBlock: BlockRef;
      latestKnownBlock: BlockRef;
      approximateRealtimeDistance: number;
    }
  /**
   * Completed
   *
   * Notes:
   * - The "completed" status only applies when all contracts, accounts, and block intervals
   *   have a defined endBlock. This means the chain will not enter the "following" status.
   *
   * Invariants:
   * - latestIndexedBlock is always the same as latestKnownBlock
   */
  | {
      status: "completed";
      config: { startBlock: BlockRef; endBlock: BlockRef | null };
      latestIndexedBlock: BlockRef;
      latestKnownBlock: BlockRef;
    };

export type IndexingStatus = { chains: Record<number, ChainIndexingStatus> };
