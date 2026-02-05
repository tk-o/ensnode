/**
 * Ponder Metadata: Block Refs
 *
 * This file describes ideas and functionality related to block references
 * based on configured chain names, chains blockranges, and RPC calls.
 */

import { ponder } from "ponder:registry";

import type { BlockRef, Blockrange, ChainId } from "@ensnode/ensnode-sdk";
import type { PonderIndexingMetrics } from "@ensnode/ponder-sdk";

import type { ChainName } from "./config";
import type { PrometheusMetrics } from "./metrics";
import { fetchBlockRef, type PublicClient } from "./rpc";

/**
 * Chain Block Refs
 *
 * Represents information about indexing scope for an indexed chain.
 */
export interface ChainBlockRefs {
  /**
   * Based on Ponder Configuration
   */
  config: {
    startBlock: BlockRef;

    endBlock: BlockRef | null;
  };

  /**
   * Based on Ponder runtime metrics
   */
  backfillEndBlock: BlockRef;
}

/**
 * Get {@link IndexedChainBlockRefs} for indexed chains.
 *
 * Guaranteed to include {@link ChainBlockRefs} for each indexed chain.
 */
export async function getChainsBlockRefs(
  chainIds: ChainId[],
  chainsBlockrange: Map<ChainId, Blockrange>,
  ponderIndexingMetrics: PonderIndexingMetrics,
  publicClients: Map<ChainId, PublicClient>,
): Promise<Map<ChainId, ChainBlockRefs>> {
  const chainsBlockRefs = new Map<ChainId, ChainBlockRefs>();
  for (const chainId of chainIds) {
    const blockrange = chainsBlockrange.get(chainId)!;
    const startBlock = blockrange.startBlock!;
    const endBlock = blockrange.endBlock;

    const publicClient = publicClients.get(chainId)!;

    const historicalTotalBlocks =
      ponderIndexingMetrics.chains.get(chainId)!.backfillSyncBlocksTotal;

    const backfillEndBlock = startBlock + historicalTotalBlocks - 1;

    try {
      // fetch relevant block refs using RPC
      const [startBlockRef, endBlockRef, backfillEndBlockRef] = await Promise.all([
        fetchBlockRef(publicClient, startBlock),
        endBlock ? fetchBlockRef(publicClient, endBlock) : null,
        fetchBlockRef(publicClient, backfillEndBlock),
      ]);

      const chainBlockRef = {
        config: {
          startBlock: startBlockRef,
          endBlock: endBlockRef,
        },
        backfillEndBlock: backfillEndBlockRef,
      } satisfies ChainBlockRefs;

      chainsBlockRefs.set(chainId, chainBlockRef);
    } catch {
      throw new Error(`Could not get BlockRefs for chain ${chainId}`);
    }
  }

  return chainsBlockRefs;
}
