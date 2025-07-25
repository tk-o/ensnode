/**
 * Zod schemas can never be included in the NPM package for ENSNode SDK.
 *
 * The only way to share Zod schemas is to re-export them from
 * `./src/internal.ts` file.
 */
import { z } from "zod/v4";

export const ChainIdSchema = z.int().positive();

export const DatetimeSchema = z.iso.datetime().transform((v) => new Date(v));

export const UrlSchema = z.url().transform((v) => new URL(v));

export const BlockRefSchema = z.object({
  createdAt: DatetimeSchema,
  number: ChainIdSchema,
});
