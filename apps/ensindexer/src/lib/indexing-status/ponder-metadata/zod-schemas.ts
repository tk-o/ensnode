/**
 * All zod schemas we define must remain internal implementation details.
 * We want the freedom to move away from zod in the future without impacting
 * any users of the ensnode-sdk package.
 *
 * The only way to share Zod schemas is to re-export them from
 * `./src/internal.ts` file.
 *
 * This file defines Zod schemas required to validate data coming from
 * Ponder metrics and Ponder status endpoints and make this data fit
 * into the ENSIndexer application data model (and its constraints).
 */

import { z } from "zod/v4";

import type { ChainId, ChainIdString, ChainIndexingStatusSnapshot } from "@ensnode/ensnode-sdk";
import {
  makeBlockRefSchema,
  makeChainIdSchema,
  makeNonNegativeIntegerSchema,
} from "@ensnode/ensnode-sdk/internal";

import { createChainIndexingSnapshot } from "./chains";
import type { ChainName } from "./config";

const PonderBlockRefSchema = makeBlockRefSchema();

const PonderCommandSchema = z.enum(["dev", "start", "serve"]);

const PonderOrderingSchema = z.literal("omnichain").prefault("omnichain");

export const PonderAppSettingsSchema = z.strictObject({
  command: PonderCommandSchema,
  ordering: PonderOrderingSchema,
});

const PonderMetricBooleanSchema = z.coerce.string().transform((v) => v === "1");

const PonderChainMetadataSchema = z.strictObject({
  chainId: makeChainIdSchema(),
  config: z.object({
    startBlock: PonderBlockRefSchema,
    endBlock: PonderBlockRefSchema.nullable(),
  }),
  backfillEndBlock: PonderBlockRefSchema,
  historicalTotalBlocks: makeNonNegativeIntegerSchema(),
  isSyncComplete: PonderMetricBooleanSchema,
  isSyncRealtime: PonderMetricBooleanSchema,
  syncBlock: PonderBlockRefSchema,
  statusBlock: PonderBlockRefSchema,
});

export const makePonderChainMetadataSchema = (indexedChainIds: ChainId[]) => {
  const invariant_definedEntryForEachIndexedChain = (v: Map<ChainId, unknown>) =>
    indexedChainIds.every((chainId) => Array.from(v.keys()).includes(chainId));

  return z
    .map(makeChainIdSchema(), PonderChainMetadataSchema)
    .refine(invariant_definedEntryForEachIndexedChain, {
      error: "All `indexedChainIds` must be represented by Ponder Chains Block Refs object.",
    })

    .transform((chains) => {
      const serializedChainIndexingStatusSnapshots = {} as Record<
        ChainIdString,
        ChainIndexingStatusSnapshot
      >;

      for (const chainId of indexedChainIds) {
        // biome-ignore lint/style/noNonNullAssertion: guaranteed to exist
        const indexedChain = chains.get(chainId)!;

        serializedChainIndexingStatusSnapshots[indexedChain.chainId] =
          createChainIndexingSnapshot(indexedChain);
      }

      return serializedChainIndexingStatusSnapshots;
    });
};
