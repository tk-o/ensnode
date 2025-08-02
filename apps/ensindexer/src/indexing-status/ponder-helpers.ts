import { BlockNumber, ChainId } from "@ensnode/ensnode-sdk";
import { PonderStatus, PrometheusMetrics } from "@ensnode/ponder-metadata";
import type {
  ChainName,
  PonderBlockNumber,
  PonderBlockRef,
  PonderBlockrange,
  PonderChainBlockRefs,
  PonderConfigDatasource,
  PonderConfigDatasourceFlat,
  PonderConfigDatasourceNested,
  PonderConfigType,
  PonderPublicClients,
} from "./ponder-types";

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

/**
 * Get a {@link PonderBlockrange} for each indexed chain.
 */
export function getChainsBlockrange(
  ponderConfig: PonderConfigType,
): Record<ChainName, PonderBlockrange> {
  const chainsBlockrange = {} as Record<ChainName, PonderBlockrange>;

  // 0. Get all ponder sources (includes chain + startBlock & endBlock)
  const ponderSources = [
    ...Object.values(ponderConfig.accounts ?? {}),
    ...Object.values(ponderConfig.blocks ?? {}),
    ...Object.values(ponderConfig.contracts ?? {}),
  ] as PonderConfigDatasource[];

  // 1. For every indexed chain
  for (const chainName of Object.keys(ponderConfig.chains)) {
    const chainStartBlocks: number[] = [];
    const chainEndBlocks: number[] = [];

    // 1.1. For every Ponder source (accounts, blocks, contracts),
    //      extract startBlock number and endBlock number.
    for (const ponderSource of ponderSources) {
      let startBlock: PonderBlockNumber | undefined;
      let endBlock: PonderBlockNumber | undefined;

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
      throw new Error(`Misconfigured endBlock found for chain '${chainName}'. Expected a number.`);
    }

    // Invariant: the indexed chain may have its endBlock defined,
    // and if so, the endBlock must be a number
    if (chainMaxEndBlock !== null && chainMinStartBlock > chainMaxEndBlock) {
      throw new Error(
        `Misconfigured blocks found for chain '${chainName}'. Expected start block to be before of same as endBlock`,
      );
    }

    let chainBlockrange: PonderBlockrange = {
      startBlock: chainMinStartBlock,
    };

    if (chainMaxEndBlock !== null) {
      chainBlockrange.endBlock = chainMaxEndBlock;
    }

    chainsBlockrange[chainName] = chainBlockrange;
  }

  return chainsBlockrange;
}

/**
 * Fetch metrics for requested Ponder instance.
 */
export async function fetchPonderMetrics(ponderAppUrl: URL): Promise<PrometheusMetrics> {
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

/**
 * Fetch Status for requested Ponder instance.
 */
export async function fetchPonderStatus(ponderAppUrl: URL): Promise<PonderStatus> {
  const ponderStatusUrl = new URL("/status", ponderAppUrl);

  try {
    const metricsText = await fetch(ponderStatusUrl).then((r) => r.json());
    const metrics = metricsText;

    return metrics;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    throw new Error(
      `Could not fetch Ponder status from '${ponderStatusUrl}' due to: ${errorMessage}`,
    );
  }
}

/**
 * Get the backfillEndBlock number for each indexed chain.

 * 
 * @throws error when `ponder_historical_total_blocks` metric was not found for an indexed chain
 * @throws error when `startBlock` value was not a number for an indexed chain
 */
function getBackfillEndBlocks(
  chainsBlockrange: Record<ChainName, PonderBlockrange>,
  metrics: PrometheusMetrics,
): Record<ChainName, BlockNumber> {
  const chainBackfillEndBlocks: Record<ChainName, BlockNumber> = {};

  for (const [chainName, chainBlockrange] of Object.entries(chainsBlockrange)) {
    const historicalTotalBlocks = metrics.getValue("ponder_historical_total_blocks", {
      chain: chainName,
    });

    if (typeof historicalTotalBlocks !== "number") {
      throw new Error(`No historical total blocks metric found for chain ${chainName}`);
    }

    if (typeof chainBlockrange.startBlock !== "number") {
      throw new Error(`No startBlock found for chain ${chainName}`);
    }

    const backfillEndBlock = chainBlockrange.startBlock + historicalTotalBlocks - 1;

    chainBackfillEndBlocks[chainName] = backfillEndBlock;
  }

  return chainBackfillEndBlocks;
}

export const DEFAULT_METRICS_FETCH_TIMEOUT = 10_000;

export const DEFAULT_METRICS_FETCH_INTERVAL = 1_000;

/**
 * Tries getting the backfillEnd block for each indexed chain.
 *
 * Returns a promise may:
 * - resolve successfully if backfillEndBlocks could be fetched
 *   before `backfillEndBlockFetchTimeout` occurs;
 * - otherwise, rejects with an error.
 */
async function tryGettingBackfillEndBlocks(
  ponderAppUrl: URL,
  chainsBlockrange: Record<ChainName, PonderBlockrange>,
  backfillEndBlockFetchTimeout = DEFAULT_METRICS_FETCH_TIMEOUT,
  backfillEndBlockFetchInterval = DEFAULT_METRICS_FETCH_INTERVAL,
): Promise<Record<ChainName, BlockNumber>> {
  return new Promise((resolve, reject) => {
    let backfillEndBlocks: Record<ChainName, BlockNumber> | undefined;

    const backfillEndBlocksTimeout = setTimeout(() => {
      clearInterval(chainsBackfillEndBlockInterval);
      reject(new Error("Could not fetch chainsBackfillEndBlock data."));
    }, backfillEndBlockFetchTimeout);

    const chainsBackfillEndBlockInterval = setInterval(async () => {
      try {
        const ponderMetrics = await fetchPonderMetrics(ponderAppUrl);

        const ponderSettingsCommand = ponderMetrics.getLabel("ponder_settings_info", "command");

        // Invariant: Ponder app is running in the indexer mode.
        if (ponderSettingsCommand !== "dev" && ponderSettingsCommand !== "start") {
          clearTimeout(backfillEndBlocksTimeout);
          clearInterval(chainsBackfillEndBlockInterval);

          reject(
            new Error(
              `Required metrics not available. The Ponder app at '${ponderAppUrl.href}' must be running in the indexer mode.`,
            ),
          );

          return;
        }

        const ponderSettingsOrdering = ponderMetrics.getLabel("ponder_settings_info", "ordering");

        // Invariant: Ponder app is using the omnichain ordering strategy.
        if (ponderSettingsOrdering !== "omnichain") {
          clearTimeout(backfillEndBlocksTimeout);
          clearInterval(chainsBackfillEndBlockInterval);

          reject(
            new Error(
              `Required metrics not available. The Ponder app at '${ponderAppUrl.href}' must index event using 'omnichain' ordering strategy.`,
            ),
          );

          return;
        }

        backfillEndBlocks = getBackfillEndBlocks(chainsBlockrange, ponderMetrics);

        clearTimeout(backfillEndBlocksTimeout);
        clearInterval(chainsBackfillEndBlockInterval);

        resolve(backfillEndBlocks);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.warn(`Error fetching backfill end blocks, retrying in 1 second. ${errorMessage}`);
        return;
      }
    }, backfillEndBlockFetchInterval);
  });
}

/**
 * Fetch {@link IndexedChainBlockRefs} for indexed chains.
 */
export async function fetchChainsBlockRefs(
  ponderAppUrl: URL,
  chainsBlockrange: Record<ChainName, PonderBlockrange>,
  publicClients: PonderPublicClients,
): Promise<Record<ChainName, PonderChainBlockRefs>> {
  const indexedChainsBlockRefs: Record<ChainName, PonderChainBlockRefs> = {};

  const chainsBackfillEndBlock = await tryGettingBackfillEndBlocks(ponderAppUrl, chainsBlockrange);

  for (const [chainName, blockrange] of Object.entries(chainsBlockrange)) {
    const { startBlock, endBlock } = blockrange;
    const backfillEndBlock = chainsBackfillEndBlock[chainName];

    if (typeof startBlock !== "number") {
      throw new Error(`startBlock must be a block number for ${chainName} chain`);
    }

    if (typeof endBlock !== "undefined" && typeof endBlock !== "number") {
      throw new Error(`endBlock must be a block number for ${chainName} chain`);
    }

    if (typeof backfillEndBlock !== "number") {
      throw new Error(`backfillEndBlock must be a block number for ${chainName} chain`);
    }

    const publicClient = publicClients[chainName];

    if (typeof publicClient === "undefined") {
      throw new Error(`Client not found for chain ${chainName}`);
    }

    const asBlockRef = (block: { number: bigint; timestamp: bigint }) =>
      ({
        number: Number(block.number),
        timestamp: Number(block.timestamp),
      }) satisfies PonderBlockRef;

    const [startBlockRef, endBlockRef, backfillEndBlockRef] = await Promise.all([
      publicClient.getBlock({ blockNumber: BigInt(startBlock) }).then(asBlockRef),
      endBlock ? publicClient.getBlock({ blockNumber: BigInt(endBlock) }).then(asBlockRef) : null,
      publicClient.getBlock({ blockNumber: BigInt(backfillEndBlock) }).then(asBlockRef),
    ]);

    indexedChainsBlockRefs[chainName] = {
      config: {
        startBlock: startBlockRef,
        endBlock: endBlockRef,
      },
      backfillEndBlock: backfillEndBlockRef,
    } satisfies PonderChainBlockRefs;
  }

  return indexedChainsBlockRefs;
}
