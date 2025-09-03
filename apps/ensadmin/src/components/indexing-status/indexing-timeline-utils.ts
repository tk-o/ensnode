import { UnixTimestamp } from "@ensnode/ensnode-sdk";
import { fromUnixTime, getUnixTime } from "date-fns";

/**
 * Calculate the position of a timestamp in a timeline.
 *
 * @param currentTimestamp
 * @param timelineStart
 * @param timelineEnd
 * @returns
 */
export function getTimelinePosition(
  currentTimestamp: UnixTimestamp,
  timelineStart: UnixTimestamp,
  timelineEnd: UnixTimestamp,
): number {
  const percentage = ((currentTimestamp - timelineStart) / (timelineEnd - timelineStart)) * 100;

  return Math.max(0, Math.min(100, percentage));
}

interface YearMarker {
  /** timestamp of the marker */
  timestamp: UnixTimestamp;

  /** position of the marker */
  position: number;

  /** label of the marker */
  label: string;
}

/**
 * Generate year markers for the timeline.
 */
export function generateYearMarkers(
  timelineStart: UnixTimestamp,
  timelineEnd: UnixTimestamp,
): Array<YearMarker> {
  const markers: Array<YearMarker> = [];

  const startYear = fromUnixTime(timelineStart).getFullYear();
  const endYear = fromUnixTime(timelineEnd).getFullYear();

  for (let year = startYear; year <= endYear; year++) {
    const yearStartTimestamp = getUnixTime(new Date(year, 0, 1));
    if (yearStartTimestamp >= timelineStart && yearStartTimestamp <= timelineEnd) {
      markers.push({
        timestamp: yearStartTimestamp,
        position: getTimelinePosition(yearStartTimestamp, timelineStart, timelineEnd),
        label: year.toString(),
      });
    }
  }

  return markers;
}
