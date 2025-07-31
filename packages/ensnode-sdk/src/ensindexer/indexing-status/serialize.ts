import { SerializedBlockRef } from "../../shared";
import { serializeBlockRef, serializeUrl } from "../../shared/serialize";
import {
  ChainIndexingBackfillStatus,
  ChainIndexingCompletedStatus,
  ChainIndexingFollowingStatus,
  type ChainIndexingNotStartedStatus,
  type ChainIndexingStatus,
  ChainIndexingStatusIds,
  ChainIndexingStatuses,
  type ENSIndexerIndexingStatus,
} from "./domain-types";
import {
  SerializedChainIndexingStatus,
  SerializedChainIndexingStatuses,
  SerializedENSIndexerIndexingStatus,
} from "./serialized-types";

/**
 * Serialize a {@link ChainIndexingStatus} object.
 */
export function serializeChainIndexingStatus(
  chainIndexingStatus: ChainIndexingStatus,
): SerializedChainIndexingStatus {
  switch (chainIndexingStatus.status) {
    case ChainIndexingStatusIds.NotStarted: {
      return {
        status: chainIndexingStatus.status,
        startBlock: serializeBlockRef(chainIndexingStatus.startBlock),
      } satisfies ChainIndexingNotStartedStatus<SerializedBlockRef>;
    }

    case ChainIndexingStatusIds.Backfill: {
      return {
        status: chainIndexingStatus.status,
        startBlock: serializeBlockRef(chainIndexingStatus.startBlock),
        backfillEndBlock: serializeBlockRef(chainIndexingStatus.backfillEndBlock),
        latestIndexedBlock: serializeBlockRef(chainIndexingStatus.latestIndexedBlock),
        latestKnownBlock: serializeBlockRef(chainIndexingStatus.latestKnownBlock),
      } satisfies ChainIndexingBackfillStatus<SerializedBlockRef>;
    }

    case ChainIndexingStatusIds.Following: {
      return {
        status: chainIndexingStatus.status,
        startBlock: serializeBlockRef(chainIndexingStatus.startBlock),
        latestIndexedBlock: serializeBlockRef(chainIndexingStatus.latestIndexedBlock),
        latestKnownBlock: serializeBlockRef(chainIndexingStatus.latestKnownBlock),
        approximateRealtimeDistance: chainIndexingStatus.approximateRealtimeDistance,
      } satisfies ChainIndexingFollowingStatus<SerializedBlockRef>;
    }

    case ChainIndexingStatusIds.Completed: {
      return {
        status: chainIndexingStatus.status,
        startBlock: serializeBlockRef(chainIndexingStatus.startBlock),
        latestIndexedBlock: serializeBlockRef(chainIndexingStatus.latestIndexedBlock),
        latestKnownBlock: serializeBlockRef(chainIndexingStatus.latestKnownBlock),
      } satisfies ChainIndexingCompletedStatus<SerializedBlockRef>;
    }
  }
}

/**
 * Serialize a {@link ChainIndexingStatuses} object.
 */
export function serializeChainIndexingStatuses(
  chainIndexingStatuses: ChainIndexingStatuses,
): SerializedChainIndexingStatuses {
  const serializedChainsIndexingStatuses: SerializedChainIndexingStatuses = {};

  for (const [chainId, chainIndexingStatus] of chainIndexingStatuses.entries()) {
    serializedChainsIndexingStatuses[chainId.toString()] =
      serializeChainIndexingStatus(chainIndexingStatus);
  }

  return serializedChainsIndexingStatuses;
}

/**
 * Serialize a {@link ENSIndexerIndexingStatus} object.
 */
export function serializeENSIndexerIndexingStatus(
  indexingStatus: ENSIndexerIndexingStatus,
): SerializedENSIndexerIndexingStatus {
  return {
    chains: serializeChainIndexingStatuses(indexingStatus.chains),
  } satisfies SerializedENSIndexerIndexingStatus;
}
