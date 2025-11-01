import type { Price, SerializedPrice } from "./currencies";
import type { ChainIdString, DatetimeISO8601, UrlString } from "./serialized-types";
import type { ChainId, Datetime } from "./types";

/**
 * Serializes a {@link ChainId} value into its string representation.
 */
export function serializeChainId(chainId: ChainId): ChainIdString {
  return chainId.toString();
}

/**
 * Serializes a {@link Datetime} value into its string representation.
 */
export function serializeDatetime(datetime: Datetime): DatetimeISO8601 {
  return datetime.toISOString();
}

/**
 * Serializes a {@link URL} value into its string representation.
 */
export function serializeUrl(url: URL): UrlString {
  return url.toString();
}

/**
 * Serializes a {@link Price} object.
 */
export function serializePrice(price: Price): SerializedPrice {
  return {
    currency: price.currency,
    amount: price.amount.toString(),
  };
}
