/**
 * Zod schemas can never be included in the NPM package for ENSNode SDK.
 *
 * The only way to share Zod schemas is to re-export them from
 * `./src/internal.ts` file.
 */
import { z } from "zod/v4";
import { ENSNamespaceIds } from "./domain-types";
import type { BlockRef, ChainId, Datetime } from "./domain-types";

/**
 * Parses value as a positive integer.
 */
export const PositiveIntegerSchema = z.int().positive();

/**
 * Parses Chain ID
 *
 * {@link ChainId}
 */
export const ChainIdSchema = PositiveIntegerSchema;

/**
 * Parses a string representation of {@link ChainId}.
 */
export const ChainIdStringSchema = z.string().transform(Number).pipe(ChainIdSchema);

/**
 * Parses an ISO-8601 string representations of {@link Datetime}
 */
export const DatetimeSchema = z.iso.datetime().transform((v) => new Date(v));

/**
 * Parses a string representations of {@link URL}
 */
export const UrlSchema = z.url().transform((v) => new URL(v));

/**
 * Parses value as a boolean.
 */
export const BooleanSchema = z.boolean();

/**
 * Parses value as the {@link BlockRef} object.
 */
export const BlockRefSchema = z.object({
  createdAt: DatetimeSchema,
  number: ChainIdSchema,
});

/**
 * Parses value as the {@link BlockRange} object.
 */
export const BlockrangeSchema = z
  .object({
    startBlock: PositiveIntegerSchema.optional(),
    endBlock: PositiveIntegerSchema.optional(),
  })
  .refine(
    (val) =>
      val.startBlock === undefined || val.endBlock === undefined || val.endBlock > val.startBlock,
    { error: "endBlock must be greater than startBlock." },
  );

export const ENSNamespaceSchema = z.enum(ENSNamespaceIds, {
  error() {
    return `Invalid ENS namespace. Supported ENS namespaces are: ${Object.keys(ENSNamespaceIds).join(", ")}`;
  },
});

export const PortSchema = PositiveIntegerSchema.max(65535, {
  error: "Port must be an integer between 1 and 65535.",
});
