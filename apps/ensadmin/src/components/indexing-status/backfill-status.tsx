/**
 * This file describes UI components required for displaying a timeline for
 * the {@link ENSIndexerOverallIndexingBackfillStatus} indexing status object.
 */

import {
  ChainIndexingStatusIds,
  ENSIndexerOverallIndexingBackfillStatus,
  UnixTimestamp,
  getTimestampForHighestOmnichainKnownBlock,
  getTimestampForLowestOmnichainStartBlock,
  sortEarliestOmnichainStartBlock,
} from "@ensnode/ensnode-sdk";
import { Clock } from "lucide-react";

import { formatDatetime } from "@/components/datetime-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChainName } from "@/lib/namespace-utils";

import { ChainIndexingTimeline } from "./indexing-timeline";
import { generateYearMarkers, getTimelinePosition } from "./indexing-timeline-utils";

interface ChainIndexingPhaseViewModel {
  status: typeof ChainIndexingStatusIds.Unstarted | typeof ChainIndexingStatusIds.Backfill;
  /**
   * Start timestamp of the indexing phase.
   */
  start: UnixTimestamp;

  /**
   * End timestamp of the indexing phase.
   */
  end: UnixTimestamp;
}

interface BackfillStatusProps {
  indexingStatus: ENSIndexerOverallIndexingBackfillStatus;
}

/**
 * Presents indexing status when overall status is "backfill".
 */
export function BackfillStatus({ indexingStatus }: BackfillStatusProps) {
  const chainEntries = sortEarliestOmnichainStartBlock([...indexingStatus.chains.entries()]);
  const chains = chainEntries.map(([, chain]) => chain);

  const timelineStart = getTimestampForLowestOmnichainStartBlock(chains);
  const timelineEnd = getTimestampForHighestOmnichainKnownBlock(chains);

  const yearMarkers = generateYearMarkers(timelineStart, timelineEnd);
  const timelinePositionValue = getTimelinePosition(
    indexingStatus.omnichainIndexingCursor,
    timelineStart,
    timelineEnd,
  );

  const timelinePosition =
    timelinePositionValue > 0 && timelinePositionValue < 100
      ? timelinePositionValue.toFixed(4)
      : timelinePositionValue;

  return (
    <main className="grid gap-4">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Backfill Status</span>

            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-blue-600" />
              <span className="text-sm font-medium">
                Indexed through {formatDatetime(indexingStatus.omnichainIndexingCursor)}
              </span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Timeline header with years */}
          <div className="relative h-6 mb-1 mt-4 ml-24">
            {yearMarkers.map((marker) => (
              <div
                key={`year-${marker.label}`}
                className="absolute -translate-x-1/2"
                style={{ left: `${marker.position}%` }}
              >
                <div className="h-3 w-0.5 bg-gray-400"></div>
                <div className="text-xs text-gray-400">{marker.label}</div>
              </div>
            ))}
          </div>

          {/* Main timeline */}
          <div className="relative mb-4 ml-24">
            {/* Timeline track */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200"></div>

            <div className="opacity-100 transition-opacity hover:opacity-0">
              {/* Current date indicator */}
              <div
                className="absolute h-full w-0.5 bg-green-800 z-20"
                style={{
                  left: `${timelinePosition}%`,
                  top: "0",
                  bottom: "0",
                  height: `${chainEntries.length * 60}px`,
                }}
              >
                <div className="absolute -bottom-8 -translate-x-1/2 whitespace-nowrap">
                  <Badge className="text-xs bg-green-800 text-white flex flex-col">
                    <span>Indexing data</span> <span>{timelinePosition}%</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Chain indexing status: progress bars */}
          <div className="space-y-6">
            {chainEntries.map(([chainId, chain]) => {
              const phases: ChainIndexingPhaseViewModel[] = [];

              if (timelineStart < chain.config.startBlock.timestamp) {
                phases.push({
                  start: timelineStart,
                  end: chain.config.startBlock.timestamp - 1,
                  status: ChainIndexingStatusIds.Unstarted,
                });
              }

              phases.push({
                start: chain.config.startBlock.timestamp,
                end: timelineEnd,
                status: ChainIndexingStatusIds.Backfill,
              });

              const lastIndexedBlock =
                chain.status === ChainIndexingStatusIds.Backfill ? chain.latestIndexedBlock : null;

              return (
                <ChainIndexingTimeline
                  key={chainId}
                  currentTimestamp={indexingStatus.omnichainIndexingCursor}
                  chainStatus={{
                    chainId,
                    chainName: getChainName(chainId),
                    firstBlockToIndex: chain.config.startBlock,
                    lastIndexedBlock,
                    phases,
                  }}
                  timelineStart={timelineStart}
                  timelineEnd={timelineEnd}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end mt-8 text-xs gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gray-400" />
              <span>Unstarted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-500" />
              <span>Backfill</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-0.5 h-3 bg-green-800"></div>
              <span>Omnichain Indexing Cursor</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
