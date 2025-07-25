import type { BlockRef, ChainId, Datetime } from "./domain-types";
import type {
  ChainIdString,
  DatetimeIso8601,
  SerializedBlockRef,
  UrlString,
} from "./serialized-types";

export function serializeChainIdString(chainId: ChainId): ChainIdString {
  return chainId.toString();
}

export function serializeDatetime(datetime: Datetime): DatetimeIso8601 {
  return datetime.toISOString();
}

export function serializeUrl(url: URL): UrlString {
  return url.toString();
}

export function serializeBlockRef(blockRef: BlockRef): SerializedBlockRef {
  return {
    createdAt: serializeDatetime(blockRef.createdAt),
    number: blockRef.number,
  } satisfies SerializedBlockRef;
}
