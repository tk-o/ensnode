import { prettifyError } from "zod/v4";
import type { BlockRef, ChainId, Datetime } from "./domain-types";
import type {
  ChainIdString,
  DatetimeIso8601,
  SerializedBlockRef,
  UrlString,
} from "./serialized-types";
import {
  makeBlockRefSchema,
  makeChainIdStringSchema,
  makeDatetimeSchema,
  makeUrlSchema,
} from "./zod-schemas";

export function deserializeChainId(maybeChainId: ChainIdString, valueLabel?: string): ChainId {
  const schema = makeChainIdStringSchema(valueLabel);
  const parsed = schema.safeParse(maybeChainId);

  if (parsed.error) {
    throw new Error(`Cannot deserialize ChainId:\n${prettifyError(parsed.error)}\n`);
  }

  return parsed.data;
}

export function deserializeDatetime(maybeDatetime: DatetimeIso8601, valueLabel?: string): Datetime {
  const schema = makeDatetimeSchema(valueLabel);
  const parsed = schema.safeParse(maybeDatetime);

  if (parsed.error) {
    throw new Error(`Cannot deserialize Datetime:\n${prettifyError(parsed.error)}\n`);
  }

  return parsed.data;
}

export function deserializeUrl(maybeUrl: UrlString, valueLabel?: string): URL {
  const schema = makeUrlSchema(valueLabel);
  const parsed = schema.safeParse(maybeUrl);

  if (parsed.error) {
    throw new Error(`Cannot deserialize URL:\n${prettifyError(parsed.error)}\n`);
  }

  return parsed.data;
}

export function deserializeBlockRef(
  maybeBlockRef: SerializedBlockRef,
  valueLabel?: string,
): BlockRef {
  const schema = makeBlockRefSchema(valueLabel);
  const parsed = schema.safeParse(maybeBlockRef);

  if (parsed.error) {
    throw new Error(`Cannot deserialize BlockRef:\n${prettifyError(parsed.error)}\n`);
  }

  return parsed.data;
}
