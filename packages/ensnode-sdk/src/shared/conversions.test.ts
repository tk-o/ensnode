import { describe, expect, it } from "vitest";
import {
  deserializeBlockRef,
  deserializeChainId,
  deserializeDatetime,
  deserializeUrl,
} from "./deserialize";
import type { BlockRef } from "./domain-types";
import { serializeBlockRef, serializeChainId, serializeDatetime, serializeUrl } from "./serialize";
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

    it("can serialize ChainId into its string representation", () => {
      expect(serializeChainId(8543)).toBe("8543");
    });

    it("can serialize Datetime into an ISO-8601 string representation", () => {
      const datetime = new Date(2020, 1, 2, 3, 22, 59, 123);

      expect(serializeDatetime(datetime)).toBe("2020-02-02T02:22:59.123Z");
    });

    it("can serialize URL into its string representation", () => {
      const url = new URL("https://admin.ensnode.io/status");

      url.searchParams.set("ensnode", "https://indexer.alpha.ensnode.io");

      expect(serializeUrl(url)).toBe(
        "https://admin.ensnode.io/status?ensnode=https%3A%2F%2Findexer.alpha.ensnode.io",
      );
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

    it("refuses to deserialize SerializedBlockRef for invalid input", () => {
      expect(() =>
        deserializeBlockRef({
          createdAt: "",
          number: 123,
        } satisfies SerializedBlockRef),
      ).toThrowError(`Cannot deserialize BlockRef:
✖ Invalid ISO datetime
  → at createdAt`);

      expect(() =>
        deserializeBlockRef({
          createdAt: new Date().toISOString(),
          number: -123,
        } satisfies SerializedBlockRef),
      ).toThrowError(`Cannot deserialize BlockRef:
✖ Too small: expected number to be >0
  → at number`);
    });

    it("can deserialize ChainId from its string representation", () => {
      expect(deserializeChainId("8543")).toStrictEqual(8543);
    });

    it("refuses to deserialize ChainId for invalid input", () => {
      expect(() => deserializeChainId("-8543")).toThrowError(`Cannot deserialize ChainId:
✖ Too small: expected number to be >0`);

      expect(() => deserializeChainId("8543.5")).toThrowError(`Cannot deserialize ChainId:
✖ Invalid input: expected int, received number`);

      expect(() => deserializeChainId("vitalik")).toThrowError(`Cannot deserialize ChainId:
✖ Invalid input: expected number, received NaN`);
    });

    it("can deserialize Datetime from an ISO-8601 string representation", () => {
      const resultDatetime = new Date(2020, 1, 2, 3, 22, 59, 123);

      expect(deserializeDatetime("2020-02-02T02:22:59.123Z")).toStrictEqual(resultDatetime);
    });

    it("refuses to deserialize Datetime for invalid input", () => {
      expect(() =>
        deserializeDatetime("202-02-02T02:22:59.123Z"),
      ).toThrowError(`Cannot deserialize Datetime:
✖ Invalid ISO datetime`);

      expect(() =>
        deserializeDatetime(123 as unknown as string),
      ).toThrowError(`Cannot deserialize Datetime:
✖ Invalid input: expected string, received number`);
    });

    it("can deserialize URL from its string representation", () => {
      const serializedUrl =
        "https://admin.ensnode.io/status?ensnode=https%3A%2F%2Findexer.alpha.ensnode.io";

      const resultUrl = new URL("https://admin.ensnode.io/status");

      resultUrl.searchParams.set("ensnode", "https://indexer.alpha.ensnode.io");

      expect(deserializeUrl(serializedUrl)).toStrictEqual(resultUrl);
    });

    it("refuses to deserialize URL for invalid input", () => {
      expect(() => deserializeUrl("example.com")).toThrowError(`Cannot deserialize URL:
✖ Invalid URL`);

      expect(() => deserializeUrl("https://")).toThrowError(`Cannot deserialize URL:
✖ Invalid URL`);

      expect(() => deserializeUrl("//example.com")).toThrowError(`Cannot deserialize URL:
✖ Invalid URL`);
    });
  });
});
