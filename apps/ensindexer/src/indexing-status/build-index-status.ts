import ponderConfig from "@/ponder/config";

import {
  type ChainName,
  type PonderChainBlockRefs,
  type PonderChainMetricsFromResponse,
  type PonderChainStatusFromResponse,
  getChainsBlockrange,
} from "@/indexing-status/ponder-metadata";

import { makePonderIndexingStatusSchema } from "@/indexing-status/zod-schemas";
import { PonderStatus, PrometheusMetrics } from "@ensnode/ponder-metadata";
import { prettifyError } from "zod/v4";

export const indexedChainNames = Object.keys(ponderConfig.chains) as [string, ...string[]];

/**
 * A {@link Blockrange} for each indexed chain.
 *
 * Invariants:
 * - every chain include a startBlock,
 * - some chains may include an endBlock,
 * - all present startBlock and endBlock values are valid {@link BlockNumber} values.
 */
export const indexedChainsBlockrange = getChainsBlockrange(ponderConfig);

interface BuildIndexingStatusFromPonderResponse {
  ponderChainsBlockRefs: Record<ChainName, PonderChainBlockRefs>;

  ponderMetrics: PrometheusMetrics;

  ponderStatus: PonderStatus;
}

export async function buildIndexingStatus({
  ponderChainsBlockRefs,
  ponderMetrics,
  ponderStatus,
}: BuildIndexingStatusFromPonderResponse) {
  const ponderChainsMetrics: Record<ChainName, PonderChainMetricsFromResponse> = {};
  const ponderChainsStatus: Record<ChainName, PonderChainStatusFromResponse> = {};

  const command = ponderMetrics.getLabel("ponder_settings_info", "command");
  const ordering = ponderMetrics.getLabel("ponder_settings_info", "ordering");

  const ponderAppSettings = {
    command,
    ordering,
  };

  for (const chainName of indexedChainNames) {
    ponderChainsMetrics[chainName] = {
      historicalCompletedBlocks: ponderMetrics.getValue("ponder_historical_completed_blocks", {
        chain: chainName,
      }),
      historicalCachedBlocks: ponderMetrics.getValue("ponder_historical_cached_blocks", {
        chain: chainName,
      }),
      historicalTotalBlocks: ponderMetrics.getValue("ponder_historical_total_blocks", {
        chain: chainName,
      }),
      isSyncComplete: ponderMetrics.getValue("ponder_sync_is_complete", { chain: chainName }),
      isSyncRealtime: ponderMetrics.getValue("ponder_sync_is_realtime", { chain: chainName }),
      syncBlock: {
        number: ponderMetrics.getValue("ponder_sync_block", { chain: chainName }),
        timestamp: ponderMetrics.getValue("ponder_sync_block_timestamp", { chain: chainName }),
      },
    } satisfies PonderChainMetricsFromResponse;

    const { id: chainId, block } = ponderStatus[chainName]!;

    ponderChainsStatus[chainName] = {
      chainId,
      block,
    } satisfies PonderChainStatusFromResponse;
  }

  const parsed = makePonderIndexingStatusSchema(indexedChainNames).safeParse({
    ponderAppSettings,
    ponderChainsStatus,
    ponderChainsMetrics,
    ponderChainsBlockRefs,
  });

  if (!parsed.success) {
    throw new Error(
      "Failed to parse Ponder indexing status data: \n" + prettifyError(parsed.error) + "\n",
    );
  }

  return parsed.data;
}
