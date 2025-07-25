import type { BlockRef, ChainId, Datetime } from "./domain-types";
import type {
  ChainIdString,
  DatetimeIso8601,
  SerializedBlockRef,
  UrlString,
} from "./serialized-types";
import { BlockRefSchema, ChainIdSchema, DatetimeSchema, UrlSchema } from "./zod-schemas";

export function deserializeChainIdString(maybeChainId: ChainIdString): ChainId {
  return ChainIdSchema.parse(maybeChainId);
}

export function deserializeDatetime(maybeDatetime: DatetimeIso8601): Datetime {
  return DatetimeSchema.parse(maybeDatetime);
}

export function deserializeUrl(maybeUrl: UrlString): URL {
  return UrlSchema.parse(maybeUrl);
}

export function deserializeBlockRef(maybeBlockRef: SerializedBlockRef): BlockRef {
  return BlockRefSchema.parse(maybeBlockRef);
}
