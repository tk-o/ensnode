import { prettifyError } from "zod/v4";
import type { BlockRef, ChainId, Datetime } from "./domain-types";
import type {
  ChainIdString,
  DatetimeIso8601,
  SerializedBlockRef,
  UrlString,
} from "./serialized-types";
import { BlockRefSchema, ChainIdStringSchema, DatetimeSchema, UrlSchema } from "./zod-schemas";

export function deserializeChainId(maybeChainId: ChainIdString): ChainId {
  const parsed = ChainIdStringSchema.safeParse(maybeChainId);

  if (parsed.error) {
    throw new Error(`Cannot deserialize ChainId:\n${prettifyError(parsed.error)}\n`);
  }

  return parsed.data;
}

export function deserializeDatetime(maybeDatetime: DatetimeIso8601): Datetime {
  const parsed = DatetimeSchema.safeParse(maybeDatetime);

  if (parsed.error) {
    throw new Error(`Cannot deserialize Datetime:\n${prettifyError(parsed.error)}\n`);
  }

  return parsed.data;
}

export function deserializeUrl(maybeUrl: UrlString): URL {
  const parsed = UrlSchema.safeParse(maybeUrl);

  if (parsed.error) {
    throw new Error(`Cannot deserialize URL:\n${prettifyError(parsed.error)}\n`);
  }

  return parsed.data;
}

export function deserializeBlockRef(maybeBlockRef: SerializedBlockRef): BlockRef {
  const parsed = BlockRefSchema.safeParse(maybeBlockRef);

  if (parsed.error) {
    throw new Error(`Cannot deserialize BlockRef:\n${prettifyError(parsed.error)}\n`);
  }

  return parsed.data;
}
