import type { ChainId, Cost } from "./types";

/**
 * Serialized representation of {@link ChainId}.
 **/
export type ChainIdString = string;

/**
 * Serialized representation of {@link Cost}.
 */
export type SerializedCost = string;

/**
 * Datetime value following the ISO 8601 standard.
 *
 * @see https://www.iso.org/iso-8601-date-and-time-format.html
 */
export type DatetimeISO8601 = string;

/**
 * Serialized representation of a {@link URL}.
 */
export type UrlString = string;
