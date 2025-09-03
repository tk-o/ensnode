import {
  IntlFormatFormatOptions,
  formatDistance,
  formatDistanceStrict,
  fromUnixTime,
  getUnixTime,
  intlFormat,
} from "date-fns";
import { useEffect, useState } from "react";

import type { UnixTimestamp } from "@ensnode/ensnode-sdk";

/**
 * Format unix timestamp as a datetime string.
 *
 * Examples:
 * ```ts
 * formatDatetime(1672531199); // "Jan 1, 2023, 12:59:59 AM"
 * formatDatetime(1672531199, { hour12: false }); // "Jan 1, 2023, 00:59:59"
 * formatDatetime(1672531199, { month: "long" }); // "January 1, 2023, 12:59:59 AM"
 * ```
 */
export function formatDatetime(
  timestamp: UnixTimestamp,
  args: Partial<IntlFormatFormatOptions> = {},
): string {
  const {
    year = "numeric",
    month = "short",
    day = "numeric",
    hour = "numeric",
    minute = "numeric",
    second = "numeric",
    hour12 = true,
  } = args;

  const date = fromUnixTime(timestamp);

  return intlFormat(date, {
    year,
    month,
    day,
    hour,
    minute,
    second,
    hour12,
  });
}

/**
 * Format unix timestamp as a date string.
 *
 * Examples:
 * ```ts
 * formatDate(1672531199); // "Jan 1, 2023"
 * formatDate(1672531199, { year: "2-digit" }); // "Jan 1, 22"
 * formatDate(1672531199, { month: "long" }); // "January 1, 2023"
 * ```
 */
export function formatDate(
  timestamp: UnixTimestamp,
  args: Partial<Pick<IntlFormatFormatOptions, "dateStyle" | "year" | "month" | "day">> = {},
): string {
  const { year = "numeric", month = "short", day = "numeric" } = args;

  const date = fromUnixTime(timestamp);

  return intlFormat(date, {
    year,
    month,
    day,
  });
}

/**
 * Formats a timestamp as its relative distance with now
 *
 * @param timestamp - the timestamp to format
 * @param enforcePast - iif true, enforces that the return value won't relate to the future.
 * Helpful for UI contexts where its nonsensical for a value to relate to the future. Ex: how long ago an event happened.
 * @param includeSeconds - if true includes seconds in the result
 * @param conciseFormatting - if true removes special prefixes
 *
 * @returns formatted relative time string
 */
export function formatRelativeTime(
  timestamp: UnixTimestamp,
  enforcePast = false,
  includeSeconds = false,
  conciseFormatting = false,
): string {
  const now = getUnixTime(new Date());

  if (enforcePast && timestamp >= now) {
    return "just now";
  }

  if (conciseFormatting) {
    return formatDistanceStrict(timestamp, now, { addSuffix: true });
  }

  return formatDistance(timestamp, now, {
    addSuffix: true,
    includeSeconds,
  });
}

/**
 * Client-only relative time component
 */
export function RelativeTime({
  timestamp,
  enforcePast = false,
  includeSeconds = false,
  conciseFormatting = false,
  prefix,
}: {
  timestamp: UnixTimestamp;
  enforcePast?: boolean;
  includeSeconds?: boolean;
  conciseFormatting?: boolean;
  prefix?: string;
}) {
  const [relativeTime, setRelativeTime] = useState<string>("");

  useEffect(() => {
    setRelativeTime(formatRelativeTime(timestamp, enforcePast, includeSeconds, conciseFormatting));
  }, [timestamp]);

  return (
    <>
      {prefix}
      {relativeTime}
    </>
  );
}

/**
 * Client-only duration component
 */
export function Duration({
  beginsAt,
  endsAt,
}: {
  beginsAt: UnixTimestamp;
  endsAt: UnixTimestamp;
}) {
  const [duration, setDuration] = useState<string>("");

  useEffect(() => {
    setDuration(formatDistanceStrict(endsAt, beginsAt));
  }, [beginsAt, endsAt]);

  return <>{duration}</>;
}
