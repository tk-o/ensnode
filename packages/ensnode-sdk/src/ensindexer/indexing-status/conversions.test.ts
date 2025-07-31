import { describe, expect, it } from "vitest";
import { deserializeENSIndexerIndexingStatus } from "./deserialize";
import {
  ChainIndexingBackfillStatus,
  ChainIndexingNotStartedStatus,
  ChainIndexingStatusIds,
  ENSIndexerIndexingStatus,
} from "./domain-types";
import { serializeENSIndexerIndexingStatus } from "./serialize";
import { SerializedENSIndexerIndexingStatus } from "./serialized-types";
import {
  earlierBlockRef,
  earlierSerializedBlockRef,
  earliestBlockRef,
  earliestSerializedBlockRef,
  latestBlockRef,
  latestSerializedBlockRef,
} from "./test-helpers";

describe("ENSIndexer: Indexing Status", () => {
  describe("ENSIndexerIndexingStatus", () => {
    it("can serialize and deserialize indexing status object", () => {
      // arrange
      const indexingStatus = {
        chains: new Map([
          [
            1,
            {
              status: ChainIndexingStatusIds.Backfill,
              startBlock: earliestBlockRef,
              latestIndexedBlock: earlierBlockRef,
              latestKnownBlock: latestBlockRef,
              backfillEndBlock: latestBlockRef,
            } satisfies ChainIndexingBackfillStatus,
          ],
          [
            8453,
            {
              status: ChainIndexingStatusIds.NotStarted,
              startBlock: earliestBlockRef,
            } satisfies ChainIndexingNotStartedStatus,
          ],
        ]),
      } satisfies ENSIndexerIndexingStatus;

      // act
      const result = serializeENSIndexerIndexingStatus(indexingStatus);

      // assert
      expect(result).toStrictEqual({
        chains: {
          "1": {
            status: ChainIndexingStatusIds.Backfill,
            startBlock: earliestSerializedBlockRef,
            latestIndexedBlock: earlierSerializedBlockRef,
            latestKnownBlock: latestSerializedBlockRef,
            backfillEndBlock: latestSerializedBlockRef,
          },
          "8453": {
            status: ChainIndexingStatusIds.NotStarted,
            startBlock: earliestSerializedBlockRef,
          },
        },
      } satisfies SerializedENSIndexerIndexingStatus);

      // bonus step: deserialize serialized
      // act
      const deserializedResult = deserializeENSIndexerIndexingStatus(result);

      // assert
      expect(deserializedResult).toStrictEqual(indexingStatus);
    });
  });
});
