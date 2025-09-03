/**
 * This file gathers ideas for UI components presenting chain indexing timeline.
 */

import { ChainName } from "@/components/chains/ChainName";
import { cn } from "@/lib/utils";
import { BlockRef, ChainId, ChainIndexingStatusIds, UnixTimestamp } from "@ensnode/ensnode-sdk";

import { formatDate } from "@/components/datetime-utils";

import { getTimelinePosition } from "./indexing-timeline-utils";

interface ChainIndexingTimelinePhaseViewModel {
  status: typeof ChainIndexingStatusIds.Unstarted | typeof ChainIndexingStatusIds.Backfill;
  start: UnixTimestamp;
  end: UnixTimestamp;
}

interface ChainIndexingTimelinePhaseProps {
  phase: ChainIndexingTimelinePhaseViewModel;
  isActive: boolean;
  timelineStart: UnixTimestamp;
  timelineEnd: UnixTimestamp;
}

/**
 * Component to display a single indexing phase,
 * such as {@link ChainIndexingStatusIds.Unstarted}
 * or {@link ChainIndexingStatusIds.Backfill}, on the chain indexing timeline.
 */
function ChainIndexingTimelinePhase({
  phase,
  isActive,
  timelineStart,
  timelineEnd,
}: ChainIndexingTimelinePhaseProps) {
  const startPos = getTimelinePosition(phase.start, timelineStart, timelineEnd);
  const endPos = phase.end ? getTimelinePosition(phase.end, timelineStart, timelineEnd) : 100;

  const width = endPos - startPos;

  // Skip rendering if width is zero or negative
  if (width <= 0) return null;

  return (
    <div
      className={cn("absolute h-5 rounded-sm z-10", {
        "bg-gray-400": phase.status === ChainIndexingStatusIds.Unstarted,
        "bg-blue-500": phase.status === ChainIndexingStatusIds.Backfill,
      })}
      style={{
        left: `${startPos}%`,
        width: `${width}%`,
        opacity: isActive ? 1 : 0.7,
        boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
        transition: "width 0.3s ease",
      }}
    >
      {width > 10 && (
        <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium capitalize">
          {phase.status}
        </span>
      )}
    </div>
  );
}

/**
 * Get the current phase of the chain indexing timeline.
 *
 * @param date current indexing date
 * @param chainStatus view model
 */
function currentPhase(
  timestamp: UnixTimestamp,
  chainStatus: {
    phases: ChainIndexingTimelinePhaseViewModel[];
  },
): ChainIndexingTimelinePhaseViewModel {
  for (let i = chainStatus.phases.length - 1; i >= 0; i--) {
    if (timestamp >= chainStatus.phases[i].start && timestamp <= chainStatus.phases[i].end) {
      return chainStatus.phases[i];
    }
  }

  return chainStatus.phases[0];
}

interface ChainIndexingTimelineProps {
  currentTimestamp: UnixTimestamp;
  timelineStart: UnixTimestamp;
  timelineEnd: UnixTimestamp;
  chainStatus: {
    chainId: ChainId;
    chainName: string;
    firstBlockToIndex: BlockRef;
    lastIndexedBlock: BlockRef | null;
    phases: ChainIndexingTimelinePhaseViewModel[];
  };
}

/**
 * Component to display chain indexing status for a single chain.
 * Includes a timeline bar for each indexing phase.
 */
export function ChainIndexingTimeline(props: ChainIndexingTimelineProps) {
  const { currentTimestamp, chainStatus, timelineStart, timelineEnd } = props;
  const currentIndexingPhase = currentPhase(currentTimestamp, chainStatus);

  return (
    <div key={chainStatus.chainId} className="flex items-center">
      {/* ChainName label */}
      <div className="w-24 pr-3 flex flex-col">
        <ChainName chainId={chainStatus.chainId} className="text-sm font-medium" />
      </div>

      {/* Chain timeline bar */}
      <div className="relative flex-1 h-6">
        {chainStatus.phases.map((phase) => (
          <ChainIndexingTimelinePhase
            key={`${chainStatus.chainId}-${phase.status}`}
            phase={phase}
            isActive={phase === currentIndexingPhase}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
          />
        ))}

        {/* Chain start indicator */}
        <div
          className="absolute w-0.5 h-5 bg-gray-800 z-10"
          style={{
            left: `${getTimelinePosition(
              chainStatus.firstBlockToIndex.timestamp,
              timelineStart,
              timelineEnd,
            )}%`,
          }}
        >
          <div className="absolute top-4 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs text-gray-600">
              {formatDate(chainStatus.firstBlockToIndex.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
