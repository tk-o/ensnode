import { z } from "zod/v4";
import type { BlockRef, ChainId, Datetime } from "./domain-types";
import type {
  ChainIdString,
  DatetimeIso8601,
  SerializedBlockRef,
  UrlString,
} from "./serialized-types";

export const ChainIdSchema = z.int().positive();

export function deserializeChainIdString(maybeChainId: ChainIdString): ChainId {
  return ChainIdSchema.parse(maybeChainId);
}

export const DatetimeSchema = z.iso.datetime().transform((v) => new Date(v));

export function deserializeDatetime(maybeDatetime: DatetimeIso8601): Datetime {
  return DatetimeSchema.parse(maybeDatetime);
}

export const UrlSchema = z.url().transform((v) => new URL(v));

export function deserializeUrl(maybeUrl: UrlString): URL {
  return UrlSchema.parse(maybeUrl);
}

export const BlockRefSchema = z.object({
  createdAt: DatetimeSchema,
  number: ChainIdSchema,
});

export function deserializeBlockRef(maybeBlockRef: SerializedBlockRef): BlockRef {
  return BlockRefSchema.parse(maybeBlockRef);
}
