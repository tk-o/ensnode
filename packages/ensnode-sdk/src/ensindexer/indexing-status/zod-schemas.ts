import z from "zod/v4";
import { BlockRef, deserializeChainId } from "../../shared";
import {
  type ZodCheckFnInput,
  makeBlockRefSchema,
  makeChainIdStringSchema,
  makeNonNegativeIntegerSchema,
} from "../../shared/zod-schemas";
import { ChainIndexingStatusIds } from "./domain-types";
import type {
  ChainIndexingBackfillStatus,
  ChainIndexingCompletedStatus,
  ChainIndexingFollowingStatus,
  ChainIndexingNotStartedStatus,
  ChainIndexingStatus,
  ChainIndexingStatuses,
  ENSIndexerIndexingStatus,
} from "./domain-types";

/**
 * Invariant: startBlock is before or the same as the latestIndexedBlock.
 */
function invariant_startBlockIsBeforeOrTheSameAsLatestIndexedBlock(
  ctx: ZodCheckFnInput<{
    startBlock: BlockRef;
    latestIndexedBlock: BlockRef;
  }>,
) {
  const { value: status } = ctx;

  if (status.startBlock.createdAt.getTime() > status.latestIndexedBlock.createdAt.getTime()) {
    ctx.issues.push({
      code: "custom",
      input: status,
      message: "The startBlock date must be before or at the latestIndexedBlock date.",
    });
  }

  if (status.startBlock.number > status.latestIndexedBlock.number) {
    ctx.issues.push({
      code: "custom",
      input: status,
      message:
        "The startBlock number must be lower than or equal to the latestIndexedBlock number.",
    });
  }
}

/**
 * Invariant: latestIndexedBlock is before or the same as the latestKnownBlock.
 */
function invariant_latestIndexedBlockIsBeforeOrTheSameAsLatestKnownBlock(
  ctx: ZodCheckFnInput<{
    latestIndexedBlock: BlockRef;
    latestKnownBlock: BlockRef;
  }>,
) {
  const { value: status } = ctx;

  if (status.latestIndexedBlock.createdAt.getTime() > status.latestKnownBlock.createdAt.getTime()) {
    ctx.issues.push({
      code: "custom",
      input: status,
      message: "The latestIndexedBlock date must be before or at the latestKnownBlock date.",
    });
  }

  if (status.latestIndexedBlock.number > status.latestKnownBlock.number) {
    ctx.issues.push({
      code: "custom",
      input: status,
      message:
        "The latestIndexedBlock number must be lower than or equal to the latestKnownBlock number.",
    });
  }
}

/**
 * Invariant: backfillEndBlock is the same as the latestKnownBlock.
 */
function invariant_backfillEndIsBlockTheSameAsLatestKnownBlock(
  ctx: ZodCheckFnInput<{
    backfillEndBlock: BlockRef;
    latestKnownBlock: BlockRef;
  }>,
) {
  const { value: status } = ctx;

  if (status.backfillEndBlock.createdAt.getTime() !== status.latestKnownBlock.createdAt.getTime()) {
    ctx.issues.push({
      code: "custom",
      input: status,
      message: "The backfillEndBlock date must be equal to the latestKnownBlock date.",
    });
  }

  if (status.backfillEndBlock.number !== status.latestKnownBlock.number) {
    ctx.issues.push({
      code: "custom",
      input: status,
      message: "The backfillEndBlock number must be equal to the latestKnownBlock number.",
    });
  }
}

/**
 * Makes Zod schema for {@link ChainIndexingNotStartedStatus} type.
 */
export const makeChainIndexingNotStartedStatusSchema = (valueLabel: string = "Value") =>
  z.strictObject({
    status: z.literal(ChainIndexingStatusIds.NotStarted),
    startBlock: makeBlockRefSchema(valueLabel),
  });

/**
 * Makes Zod schema for {@link ChainIndexingBackfillStatus} type.
 */
export const makeChainIndexingBackfillStatusSchema = (valueLabel: string = "Value") =>
  z
    .strictObject({
      status: z.literal(ChainIndexingStatusIds.Backfill),
      startBlock: makeBlockRefSchema(valueLabel),
      latestIndexedBlock: makeBlockRefSchema(valueLabel),
      latestKnownBlock: makeBlockRefSchema(valueLabel),
      backfillEndBlock: makeBlockRefSchema(valueLabel),
    })
    .check(invariant_startBlockIsBeforeOrTheSameAsLatestIndexedBlock)
    .check(invariant_latestIndexedBlockIsBeforeOrTheSameAsLatestKnownBlock)
    .check(invariant_backfillEndIsBlockTheSameAsLatestKnownBlock);

/**
 * Makes Zod schema for {@link ChainIndexingFollowingStatus} type.
 */
export const makeChainIndexingFollowingStatusSchema = (valueLabel: string = "Value") =>
  z
    .strictObject({
      status: z.literal(ChainIndexingStatusIds.Following),
      startBlock: makeBlockRefSchema(valueLabel),
      latestIndexedBlock: makeBlockRefSchema(valueLabel),
      latestKnownBlock: makeBlockRefSchema(valueLabel),
      approximateRealtimeDistance: makeNonNegativeIntegerSchema(valueLabel),
    })
    .check(invariant_startBlockIsBeforeOrTheSameAsLatestIndexedBlock)
    .check(invariant_latestIndexedBlockIsBeforeOrTheSameAsLatestKnownBlock);

/**
 * Makes Zod schema for {@link ChainIndexingCompletedStatus} type.
 */
export const makeChainIndexingCompletedStatusSchema = (valueLabel: string = "Value") =>
  z
    .strictObject({
      status: z.literal(ChainIndexingStatusIds.Completed),
      startBlock: makeBlockRefSchema(valueLabel),
      latestIndexedBlock: makeBlockRefSchema(valueLabel),
      latestKnownBlock: makeBlockRefSchema(valueLabel),
    })
    .check(invariant_startBlockIsBeforeOrTheSameAsLatestIndexedBlock)
    .check(invariant_latestIndexedBlockIsBeforeOrTheSameAsLatestKnownBlock);

/**
 * Makes Zod schema for {@link ChainIndexingStatus}
 */
export const makeChainIndexingStatusSchema = (valueLabel: string = "Value") =>
  z.discriminatedUnion("status", [
    makeChainIndexingNotStartedStatusSchema(valueLabel),
    makeChainIndexingBackfillStatusSchema(valueLabel),
    makeChainIndexingFollowingStatusSchema(valueLabel),
    makeChainIndexingCompletedStatusSchema(valueLabel),
  ]);

/**
 * Makes Zod schema for {@link ChainIndexingStatuses}
 */
export const makeChainIndexingStatusesSchema = (valueLabel: string = "Value") =>
  z
    .record(makeChainIdStringSchema(), makeChainIndexingStatusSchema(valueLabel), {
      error: "Chains configuration must be an object mapping valid chain IDs to their configs.",
    })
    .transform((serializedChainsIndexingStatus) => {
      const chainsIndexingStatus: ENSIndexerIndexingStatus["chains"] = new Map();

      for (const [chainIdString, chainStatus] of Object.entries(serializedChainsIndexingStatus)) {
        chainsIndexingStatus.set(deserializeChainId(chainIdString), chainStatus);
      }

      return chainsIndexingStatus;
    });

/**
 * ENSIndexer Indexing Status Schema
 *
 * Makes a Zod schema definition for validating indexing status
 * across all chains indexed by ENSIndexer instance.
 */
export const makeENSIndexerIndexingStatusSchema = (
  valueLabel: string = "ENSIndexerIndexingStatus",
) =>
  z.object({
    chains: makeChainIndexingStatusesSchema(valueLabel),
  });
