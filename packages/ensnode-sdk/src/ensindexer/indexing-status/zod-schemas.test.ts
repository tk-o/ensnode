import { describe, expect, it } from "vitest";
import { type ZodSafeParseResult, prettifyError } from "zod/v4";
import { SerializedBlockRef, deserializeBlockRef } from "../../shared";
import {
  ChainIndexingBackfillStatus,
  ChainIndexingFollowingStatus,
  ChainIndexingNotStartedStatus,
  ChainIndexingStatusIds,
} from "./domain-types";
import { SerializedChainIndexingStatus } from "./serialized-types";
import {
  earlierBlockRef,
  earlierSerializedBlockRef,
  earliestBlockRef,
  earliestSerializedBlockRef,
  laterBlockRef,
  laterSerializedBlockRef,
  latestBlockRef,
  latestSerializedBlockRef,
} from "./test-helpers";
import { makeChainIndexingStatusSchema } from "./zod-schemas";

describe("ENSIndexer: Indexing Status", () => {
  describe("Zod Schemas", () => {
    const formatParseError = <T>(zodParseError: ZodSafeParseResult<T>) =>
      prettifyError(zodParseError.error!);

    describe("ChainIndexingNotStartedStatus", () => {
      it("can parse a valid serialized status object", () => {
        // arrange
        const serialized: SerializedChainIndexingStatus = {
          status: ChainIndexingStatusIds.NotStarted,
          startBlock: earlierSerializedBlockRef,
        } satisfies ChainIndexingNotStartedStatus<SerializedBlockRef>;

        // act
        const parsed = makeChainIndexingStatusSchema().parse(serialized);

        // assert
        expect(parsed).toStrictEqual({
          status: ChainIndexingStatusIds.NotStarted,
          startBlock: earlierBlockRef,
        } satisfies ChainIndexingNotStartedStatus);
      });
    });

    describe("ChainIndexingBackfillStatus", () => {
      it("can parse a valid serialized status object", () => {
        // arrange
        const serialized: SerializedChainIndexingStatus = {
          status: ChainIndexingStatusIds.Backfill,
          startBlock: earliestSerializedBlockRef,
          latestIndexedBlock: earlierSerializedBlockRef,
          latestKnownBlock: laterSerializedBlockRef,
          backfillEndBlock: laterSerializedBlockRef,
        } satisfies ChainIndexingBackfillStatus<SerializedBlockRef>;

        // act
        const parsed = makeChainIndexingStatusSchema().parse(serialized);

        // assert
        expect(parsed).toStrictEqual({
          status: ChainIndexingStatusIds.Backfill,
          startBlock: earliestBlockRef,
          latestIndexedBlock: earlierBlockRef,
          latestKnownBlock: laterBlockRef,
          backfillEndBlock: laterBlockRef,
        } satisfies ChainIndexingBackfillStatus);
      });

      it("won't parse if the startBlock is after the latestIndexedBlock", () => {
        // arrange
        const serialized: SerializedChainIndexingStatus = {
          status: ChainIndexingStatusIds.Backfill,
          startBlock: laterSerializedBlockRef,
          latestIndexedBlock: earlierSerializedBlockRef,
          latestKnownBlock: laterSerializedBlockRef,
          backfillEndBlock: laterSerializedBlockRef,
        } satisfies ChainIndexingBackfillStatus<SerializedBlockRef>;

        // act
        const notParsed = formatParseError(makeChainIndexingStatusSchema().safeParse(serialized));

        // assert
        expect(
          notParsed,
        ).toBe(`✖ The startBlock date must be before or at the latestIndexedBlock date.
✖ The startBlock number must be lower than or equal to the latestIndexedBlock number.`);
      });

      it("won't parse if the latestIndexedBlock is after the latestKnownBlock", () => {
        // arrange
        const serialized: SerializedChainIndexingStatus = {
          status: ChainIndexingStatusIds.Backfill,
          startBlock: earlierSerializedBlockRef,
          latestIndexedBlock: latestSerializedBlockRef,
          latestKnownBlock: laterSerializedBlockRef,
          backfillEndBlock: laterSerializedBlockRef,
        } satisfies ChainIndexingBackfillStatus<SerializedBlockRef>;

        // act
        const notParsed = formatParseError(makeChainIndexingStatusSchema().safeParse(serialized));

        // assert
        expect(
          notParsed,
        ).toBe(`✖ The latestIndexedBlock date must be before or at the latestKnownBlock date.
✖ The latestIndexedBlock number must be lower than or equal to the latestKnownBlock number.`);
      });

      it("won't parse if the backfillEndBlock different than the latestKnownBlock", () => {
        // arrange
        const serialized: SerializedChainIndexingStatus = {
          status: ChainIndexingStatusIds.Backfill,
          startBlock: earlierSerializedBlockRef,
          latestIndexedBlock: earlierSerializedBlockRef,
          latestKnownBlock: laterSerializedBlockRef,
          backfillEndBlock: latestSerializedBlockRef,
        } satisfies ChainIndexingBackfillStatus<SerializedBlockRef>;

        // act
        const notParsed = formatParseError(makeChainIndexingStatusSchema().safeParse(serialized));

        // assert
        expect(
          notParsed,
        ).toBe(`✖ The backfillEndBlock date must be equal to the latestKnownBlock date.
✖ The backfillEndBlock number must be equal to the latestKnownBlock number.`);
      });
    });

    describe("ChainIndexingFollowingStatus", () => {
      it("can parse a valid serialized status object", () => {
        // arrange
        const serialized: SerializedChainIndexingStatus = {
          status: ChainIndexingStatusIds.Following,
          startBlock: earliestSerializedBlockRef,
          latestIndexedBlock: laterSerializedBlockRef,
          latestKnownBlock: latestSerializedBlockRef,
          approximateRealtimeDistance: 0,
        } satisfies ChainIndexingFollowingStatus<SerializedBlockRef>;

        // act
        const parsed = makeChainIndexingStatusSchema().parse(serialized);

        // assert
        expect(parsed).toStrictEqual({
          status: ChainIndexingStatusIds.Following,
          startBlock: earliestBlockRef,
          latestIndexedBlock: laterBlockRef,
          latestKnownBlock: latestBlockRef,
          approximateRealtimeDistance: 0,
        } satisfies ChainIndexingFollowingStatus);
      });

      it("won't parse if the startBlock is after the latestIndexedBlock", () => {
        // arrange
        const serialized: SerializedChainIndexingStatus = {
          status: ChainIndexingStatusIds.Following,
          startBlock: laterSerializedBlockRef,
          latestIndexedBlock: earlierSerializedBlockRef,
          latestKnownBlock: laterSerializedBlockRef,
          approximateRealtimeDistance: 777,
        } satisfies ChainIndexingFollowingStatus<SerializedBlockRef>;

        // act
        const notParsed = formatParseError(makeChainIndexingStatusSchema().safeParse(serialized));

        // assert
        expect(
          notParsed,
        ).toBe(`✖ The startBlock date must be before or at the latestIndexedBlock date.
✖ The startBlock number must be lower than or equal to the latestIndexedBlock number.`);
      });

      it("won't parse if the latestIndexedBlock is after the latestKnownBlock", () => {
        // arrange
        const serialized: SerializedChainIndexingStatus = {
          status: ChainIndexingStatusIds.Following,
          startBlock: earlierSerializedBlockRef,
          latestIndexedBlock: latestSerializedBlockRef,
          latestKnownBlock: laterSerializedBlockRef,
          approximateRealtimeDistance: 777,
        } satisfies ChainIndexingFollowingStatus<SerializedBlockRef>;

        // act
        const notParsed = formatParseError(makeChainIndexingStatusSchema().safeParse(serialized));

        // assert
        expect(
          notParsed,
        ).toBe(`✖ The latestIndexedBlock date must be before or at the latestKnownBlock date.
✖ The latestIndexedBlock number must be lower than or equal to the latestKnownBlock number.`);
      });

      it("won't parse if the approximateRealtimeDistance was a negative integer", () => {
        // arrange
        const serialized: SerializedChainIndexingStatus = {
          status: ChainIndexingStatusIds.Following,
          startBlock: earlierSerializedBlockRef,
          latestIndexedBlock: earlierSerializedBlockRef,
          latestKnownBlock: laterSerializedBlockRef,
          approximateRealtimeDistance: -1,
        } satisfies ChainIndexingFollowingStatus<SerializedBlockRef>;

        // act
        const notParsed = formatParseError(makeChainIndexingStatusSchema().safeParse(serialized));

        // assert
        expect(notParsed).toBe(`✖ Value must be a non-negative integer (>=0).
  → at approximateRealtimeDistance`);
      });
    });
  });
});
