import { PrometheusMetrics } from "../prometheus-metrics";
import type {
  BlockRef,
  ChainId,
  ChainName,
  IndexedChainBlockRefs,
  IndexedChainsBlockRefs,
  PonderBlock,
  PonderConfigDatasource,
  PonderConfigDatasourceFlat,
  PonderConfigDatasourceNested,
  PonderConfigType,
  PonderPublicClients,
} from "./types";

/**
 * Ensure the `ponderDatasource` is {@link PonderConfigDatasourceFlat}.
 */
function isPonderDatasourceFlat(
  ponderDatasource: PonderConfigDatasource,
): ponderDatasource is PonderConfigDatasourceFlat {
  return typeof ponderDatasource.chain === "string";
}

/**
 * Ensure the `ponderDatasource` is {@link PonderConfigDatasourceNested}.
 */
function isPonderDatasourceNested(
  ponderDatasource: PonderConfigDatasource,
): ponderDatasource is PonderConfigDatasourceNested {
  return typeof ponderDatasource.chain === "object";
}

type IndexedChainBlockrange = {
  chainId: ChainId;
  startBlock: BlockRef["number"];
  endBlock: BlockRef["number"] | null;
};

/**
 * Get {@link IndexedChainBlockrange} for each indexed chain.
 */
function getBlockrangeForIndexedChains(
  ponderConfig: PonderConfigType,
): Record<ChainName, IndexedChainBlockrange> {
  const chainsBlockrange = {} as Record<ChainName, IndexedChainBlockrange>;

  // 0. Get all ponder sources (includes chain + startBlock & endBlock)
  const ponderSources = [
    ...Object.values(ponderConfig.accounts ?? {}),
    ...Object.values(ponderConfig.blocks ?? {}),
    ...Object.values(ponderConfig.contracts ?? {}),
  ] as PonderConfigDatasource[];

  // 1. For every indexed chain
  for (const [chainName, chain] of Object.entries(ponderConfig.chains)) {
    const chainStartBlocks: number[] = [];
    const chainEndBlocks: number[] = [];

    // 1.1. For every Ponder source (accounts, blocks, contracts),
    //      extract startBlock number and endBlock number.
    for (const ponderSource of ponderSources) {
      let startBlock: PonderBlock | undefined;
      let endBlock: PonderBlock | undefined;

      if (isPonderDatasourceFlat(ponderSource) && ponderSource.chain === chainName) {
        startBlock = ponderSource.startBlock;
        endBlock = ponderSource.endBlock;
      } else if (isPonderDatasourceNested(ponderSource) && ponderSource.chain[chainName]) {
        startBlock = ponderSource.chain[chainName].startBlock;
        endBlock = ponderSource.chain[chainName].endBlock;
      }

      if (typeof startBlock === "number") {
        chainStartBlocks.push(startBlock);
      }

      if (typeof endBlock === "number") {
        chainEndBlocks.push(endBlock);
      }
    }

    // 2. Get the smallest startBlock for the chain.
    const chainMinStartBlock = chainStartBlocks.length > 0 ? Math.min(...chainStartBlocks) : null;

    // Invariant: the indexed chain must have its startBlock defined as number.
    if (typeof chainMinStartBlock !== "number") {
      throw new Error(
        `No minimum start block found for chain '${chainName}'. Either all contracts, accounts, and block intervals use "latest" (unsupported) or the chain is misconfigured.`,
      );
    }

    // 3. Get the largest endBLock for the chain.
    const chainMaxEndBlock = chainEndBlocks.length > 0 ? Math.min(...chainEndBlocks) : null;

    // Invariant: the indexed chain may have its endBlock defined,
    // and if so, the endBlock must be a number
    if (chainMaxEndBlock !== null && typeof chainMaxEndBlock !== "number") {
      throw new Error(`Misconfigured end block found for chain '${chainName}'.`);
    }

    chainsBlockrange[chainName] = {
      chainId: chain.id,
      startBlock: chainMinStartBlock,
      endBlock: chainMaxEndBlock,
    } satisfies IndexedChainBlockrange;
  }

  return chainsBlockrange;
}

/**
 * Fetch metrics for requested Ponder instance.
 */
async function fetchPonderMetrics(ponderAppUrl: URL): Promise<PrometheusMetrics> {
  const ponderMetricsUrl = new URL("/metrics", ponderAppUrl);

  try {
    const metricsText = await fetch(ponderMetricsUrl).then((r) => r.text());
    const metrics = PrometheusMetrics.parse(metricsText);

    return metrics;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    throw new Error(
      `Could not fetch Ponder metrics from '${ponderMetricsUrl}' due to: ${errorMessage}`,
    );
  }
}

type ChainsBackfillEndBlock = { [chainName: string]: BlockRef["number"] };

/**
 * Get the backfillEndBlock number for each indexed chain.
 */
function getBackfillEndBlocks(
  chainsBlockrange: Record<ChainName, IndexedChainBlockrange>,
  metrics: PrometheusMetrics,
): ChainsBackfillEndBlock {
  const chainBackfillEndBlocks: ChainsBackfillEndBlock = {};

  for (const [chainName, chainBlockrange] of Object.entries(chainsBlockrange)) {
    const historicalTotalBlocks = metrics.getValue("ponder_historical_total_blocks", {
      chain: chainName,
    });

    if (typeof historicalTotalBlocks === "undefined") {
      throw new Error(`No historical total blocks metric found for chain ${chainName}`);
    }

    if (typeof chainBlockrange.startBlock !== "number") {
      throw new Error(`No historical total blocks metric found for chain ${chainName}`);
    }

    const backfillEndBlock = chainBlockrange.startBlock + historicalTotalBlocks - 1;

    chainBackfillEndBlocks[chainName] = backfillEndBlock;
  }

  return chainBackfillEndBlocks;
}

const DEFAULT_METRICS_FETCH_TIMEOUT = 10_000;
const DEFAULT_METRICS_FETCH_INTERVAL = 1_000;

/**
 * Fetch {@link IndexedChainBlockRefs} for indexed chains.
 */
export async function fetchIndexedChainsBlockRefs(
  ponderAppUrl: URL,
  ponderConfig: PonderConfigType,
  publicClients: PonderPublicClients,
  backfillEndBlockFetchTimeout = DEFAULT_METRICS_FETCH_TIMEOUT,
  backfillEndBlockFetchInterval = DEFAULT_METRICS_FETCH_INTERVAL,
): Promise<IndexedChainsBlockRefs> {
  const indexedChainsBlockRefs: IndexedChainsBlockRefs = {};

  const chainsBlockrange = getBlockrangeForIndexedChains(ponderConfig);
  const chainsBackfillEndBlock = await new Promise<ChainsBackfillEndBlock>((resolve, reject) => {
    let backfillEndBlocks: ChainsBackfillEndBlock | undefined;

    const backfillEndBlocksTimeout = setTimeout(() => {
      clearInterval(chainsBackfillEndBlockInterval);
      reject(new Error("Could not fetch chainsBackfillEndBlock data."));
    }, backfillEndBlockFetchTimeout);

    const chainsBackfillEndBlockInterval = setInterval(async () => {
      try {
        const ponderMetrics = await fetchPonderMetrics(ponderAppUrl);

        if (ponderMetrics.getLabel("ponder_settings_info", "command") === "serve") {
          clearTimeout(backfillEndBlocksTimeout);
          clearInterval(chainsBackfillEndBlockInterval);

          reject(
            new Error(
              `Required metrics not available. Ponder app at '${ponderAppUrl.href}' is running in the data server mode.`,
            ),
          );
        }

        backfillEndBlocks = getBackfillEndBlocks(chainsBlockrange, ponderMetrics);

        clearTimeout(backfillEndBlocksTimeout);
        clearInterval(chainsBackfillEndBlockInterval);

        resolve(backfillEndBlocks);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.warn(`Error fetching backfill end blocks, retrying in 1 second. ${errorMessage}`);
      }
    }, backfillEndBlockFetchInterval);
  });

  for (const [chainName, blockrange] of Object.entries(chainsBlockrange)) {
    const { startBlock, endBlock } = blockrange;
    const backfillEndBlock = chainsBackfillEndBlock[chainName];

    if (typeof backfillEndBlock !== "number") {
      throw new Error(`The backfillEndBlock is missing for ${chainName} chain`);
    }

    const publicClient = publicClients[chainName];

    if (typeof publicClient === "undefined") {
      throw new Error(`Client not found for chain ${chainName}`);
    }

    const asBlockRef = (block: { number: bigint; timestamp: bigint }) =>
      ({
        number: Number(block.number),
        timestamp: Number(block.timestamp),
      }) satisfies BlockRef;

    const [startBlockRef, endBlockRef, backfillEndBlockRef] = await Promise.all([
      publicClient.getBlock({ blockNumber: BigInt(startBlock) }).then(asBlockRef),
      endBlock ? publicClient.getBlock({ blockNumber: BigInt(endBlock) }).then(asBlockRef) : null,
      publicClient.getBlock({ blockNumber: BigInt(backfillEndBlock) }).then(asBlockRef),
    ]);

    indexedChainsBlockRefs[chainName] = {
      chainId: blockrange.chainId,
      startBlock: startBlockRef,
      endBlock: endBlockRef,
      backfillEndBlock: backfillEndBlockRef,
    } satisfies IndexedChainBlockRefs;
  }

  return indexedChainsBlockRefs;
}
