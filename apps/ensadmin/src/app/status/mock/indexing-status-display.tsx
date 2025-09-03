// Temporary mock page until indexing-status is detached from data loading
"use client";

import {
  type ENSIndexerOverallIndexingStatus,
  OverallIndexingStatusIds,
  type UnixTimestamp,
} from "@ensnode/ensnode-sdk";
import { type ReactElement } from "react";

import { BackfillStatus } from "@/components/indexing-status/backfill-status";
import {
  IndexingStatsForBackfillStatus,
  IndexingStatsForCompletedStatus,
  IndexingStatsForFollowingStatus,
  IndexingStatsForIndexerErrorStatus,
  IndexingStatsForUnstartedStatus,
  IndexingStatsShell,
} from "@/components/indexing-status/indexing-stats";
import { IndexingStatusPlaceholder } from "@/components/indexing-status/indexing-status-placeholder";

interface MockIndexingStatusDisplayPropsProps {
  indexingStatus: ENSIndexerOverallIndexingStatus;
}

export function MockIndexingStatusDisplay({ indexingStatus }: MockIndexingStatusDisplayPropsProps) {
  let indexingStats: ReactElement;
  let maybeIndexingTimeline: ReactElement | undefined;
  let omnichainIndexingCursor: UnixTimestamp | undefined;

  switch (indexingStatus.overallStatus) {
    case OverallIndexingStatusIds.IndexerError:
      indexingStats = <IndexingStatsForIndexerErrorStatus />;
      break;

    case OverallIndexingStatusIds.Unstarted:
      indexingStats = <IndexingStatsForUnstartedStatus indexingStatus={indexingStatus} />;
      break;

    case OverallIndexingStatusIds.Backfill:
      indexingStats = <IndexingStatsForBackfillStatus indexingStatus={indexingStatus} />;

      maybeIndexingTimeline = <BackfillStatus indexingStatus={indexingStatus} />;

      omnichainIndexingCursor = indexingStatus.omnichainIndexingCursor;
      break;

    case OverallIndexingStatusIds.Completed:
      indexingStats = <IndexingStatsForCompletedStatus indexingStatus={indexingStatus} />;

      omnichainIndexingCursor = indexingStatus.omnichainIndexingCursor;
      break;

    case OverallIndexingStatusIds.Following:
      indexingStats = <IndexingStatsForFollowingStatus indexingStatus={indexingStatus} />;

      omnichainIndexingCursor = indexingStatus.omnichainIndexingCursor;
      break;

    default:
      // This should never happen, but provide fallback
      indexingStats = <IndexingStatsForIndexerErrorStatus />;
  }

  return (
    <>
      {maybeIndexingTimeline}

      <IndexingStatsShell
        overallStatus={indexingStatus.overallStatus}
        omnichainIndexingCursor={omnichainIndexingCursor}
      >
        {indexingStats}
      </IndexingStatsShell>
    </>
  );
}

export function MockIndexingStatusDisplayWithProps({
  indexingStatus,
  loading = false,
  error = null,
}: {
  indexingStatus?: ENSIndexerOverallIndexingStatus;
  loading?: boolean;
  error?: string | null;
}) {
  if (error) {
    return <p className="p-6">Failed to fetch data: {error}</p>;
  }

  if (loading || !indexingStatus) {
    return <IndexingStatusPlaceholder />;
  }

  return <MockIndexingStatusDisplay indexingStatus={indexingStatus} />;
}
