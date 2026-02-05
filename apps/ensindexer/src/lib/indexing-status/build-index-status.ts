/**
 * Build Indexing Status
 *
 * This file includes ideas and functionality integrating Ponder Metadata
 * with ENSIndexer application. Here all Ponder Metadata concepts, such as
 * - chain configuration from `ponder.config.ts` file,
 * - metrics from `/metrics` endpoint,
 * - publicClients from `ponder:api` import,
 * - status from `/status` endpoint,
 * all turn into the ENSIndexer data model.
 */

import config from "@/config";

import {
  type ChainId,
  type CrossChainIndexingStatusSnapshotOmnichain,
  CrossChainIndexingStrategyIds,
  deserializeChainId,
  deserializeOmnichainIndexingStatusSnapshot,
  type OmnichainIndexingStatusSnapshot,
  type UnixTimestamp,
} from "@ensnode/ensnode-sdk";
import type {
  PonderClient,
  PonderIndexingMetrics,
  PonderIndexingStatus,
} from "@ensnode/ponder-sdk";

import ponderConfig from "@/ponder/config";

import {
  type ChainBlockRefs,
  createSerializedChainSnapshots,
  createSerializedOmnichainIndexingStatusSnapshot,
  getChainsBlockRefs,
  getChainsBlockrange,
  type PublicClient,
} from "./ponder-metadata";

/**
 * Names for each indexed chain
 */
const chainIds = Object.keys(ponderConfig.chains).map((chainId) => deserializeChainId(chainId));

/**
 * A {@link Blockrange} for each indexed chain.
 *
 * Invariants:
 * - every chain include a startBlock,
 * - some chains may include an endBlock,
 * - all present startBlock and endBlock values are valid {@link BlockNumber} values.
 */
const chainsBlockrange = getChainsBlockrange(ponderConfig);

/**
 * Chain Block Refs
 *
 * {@link ChainBlockRefs} for each indexed chain.
 *
 * Note: works as cache for {@link getChainsBlockRefs}.
 */
let chainsBlockRefs = new Map<ChainId, ChainBlockRefs>();

/**
 * Get cached {@link IndexedChainBlockRefs} for indexed chains.
 *
 * Guaranteed to include {@link ChainBlockRefs} for each indexed chain.
 *
 * Note: performs a network request only once and caches response to
 * re-use it for further `getChainsBlockRefs` calls.
 */
async function getChainsBlockRefsCached(
  ponderIndexingMetrics: PonderIndexingMetrics,
  publicClients: Map<ChainId, PublicClient>,
): Promise<Map<ChainId, ChainBlockRefs>> {
  // early-return the cached chain block refs
  if (chainsBlockRefs.size > 0) {
    return chainsBlockRefs;
  }

  chainsBlockRefs = await getChainsBlockRefs(
    chainIds,
    chainsBlockrange,
    ponderIndexingMetrics,
    publicClients,
  );

  return chainsBlockRefs;
}

export async function buildOmnichainIndexingStatusSnapshot(
  ponderClient: PonderClient,
  publicClients: Map<ChainId, PublicClient>,
): Promise<OmnichainIndexingStatusSnapshot> {
  let ponderIndexingMetrics: PonderIndexingMetrics;
  let ponderIndexingStatus: PonderIndexingStatus;

  try {
    // Get current Ponder metadata (metrics, status)
    const responses = await Promise.all([ponderClient.metrics(), ponderClient.status()]);

    ponderIndexingMetrics = responses[0];
    ponderIndexingStatus = responses[1];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Could not fetch data from ENSIndexer at ${config.ensIndexerUrl.href}: ${errorMessage}.`,
    );
  }

  // get BlockRefs for relevant blocks
  const chainsBlockRefs = await getChainsBlockRefsCached(ponderIndexingMetrics, publicClients);

  // create serialized chain indexing snapshot for each indexed chain
  const serializedChainSnapshots = createSerializedChainSnapshots(
    chainIds,
    chainsBlockRefs,
    ponderIndexingMetrics,
    ponderIndexingStatus,
  );

  const serializedOmnichainSnapshot =
    createSerializedOmnichainIndexingStatusSnapshot(serializedChainSnapshots);

  return deserializeOmnichainIndexingStatusSnapshot(serializedOmnichainSnapshot);
}

export function createCrossChainIndexingStatusSnapshotOmnichain(
  omnichainSnapshot: OmnichainIndexingStatusSnapshot,
  snapshotTime: UnixTimestamp,
): CrossChainIndexingStatusSnapshotOmnichain {
  return {
    strategy: CrossChainIndexingStrategyIds.Omnichain,
    slowestChainIndexingCursor: omnichainSnapshot.omnichainIndexingCursor,
    snapshotTime,
    omnichainSnapshot,
  };
}
