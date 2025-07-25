import { describe, expect, it } from "vitest";
import { deserializeBlockRef } from "./deserialize";
import type { BlockRef } from "./domain-types";
import { serializeBlockRef } from "./serialize";
import type { SerializedBlockRef } from "./serialized-types";

describe("ENSIndexer: Shared", () => {
  describe("serialization", () => {
    it("can serialize BlockRef", () => {
      // arrange
      const blockCreatedAt = new Date();
      const blockRef = {
        createdAt: blockCreatedAt,
        number: 123,
      } satisfies BlockRef;

      // act
      const result = serializeBlockRef(blockRef);

      // assert
      expect(result).toStrictEqual({
        createdAt: blockCreatedAt.toISOString(),
        number: 123,
      } satisfies SerializedBlockRef);
    });
  });

  describe("deserialization", () => {
    it("can deserialize SerializedBlockRef", () => {
      // arrange
      const blockCreatedAt = new Date();
      const serializedBlockRef = {
        createdAt: blockCreatedAt.toISOString(),
        number: 123,
      } satisfies SerializedBlockRef;

      // act
      const result = deserializeBlockRef(serializedBlockRef);

      // assert
      expect(result).toStrictEqual({
        createdAt: blockCreatedAt,
        number: 123,
      } satisfies BlockRef);
    });
  });
});
