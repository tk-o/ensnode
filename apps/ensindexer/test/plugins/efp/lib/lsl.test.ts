import {
  ListStorageLocationType,
  ListStorageLocationVersion,
  decodeListStorageLocationContract,
} from "@/plugins/efp/lib/lsl";
import { describe, expect, it } from "vitest";

describe("EFP List Storage Location", () => {
  describe("V1 EVMContract", () => {
    describe("decodeListStorageLocationContract", () => {
      it("should decode a valid V1 EVMContract List Storage Location", () => {
        const encodedLsl =
          "0x010100000000000000000000000000000000000000000000000000000000000000015289fe5dabc021d02fddf23d4a4df96f4e0f17ef469e5ab72064e89164e9792a7f05d5bc073c2dfb1bb6da7b801e1bb2192808cc";

        expect(decodeListStorageLocationContract("mainnet", encodedLsl)).toEqual({
          type: ListStorageLocationType.EVMContract,
          version: ListStorageLocationVersion.V1,
          chainId: 1,
          listRecordsAddress: "0x5289fe5dabc021d02fddf23d4a4df96f4e0f17ef",
          slot: 31941687331316587819122038778003974753188806173854071805743471973008610429132n,
        });
      });

      it("should not decode encoded LSL when chainId value is out of bounds (too small)", () => {
        const encodedLsl =
          "0x0101000000000000000000000000000000000000000000000000000000000000000041aa48ef3c0446b46a5b1cc6337ff3d3716e2a33073b78bf041b622ff5f1b972b5839062cbe5ab0efb4917745873e00305d7c0cb";

        expect(() =>
          decodeListStorageLocationContract("mainnet", encodedLsl),
        ).toThrowError(`Failed to decode the encoded List Storage Location contract object: 
✖ chainId must be a positive safe integer value
  → at chainId
✖ chainId must be one of the EFP deployment Chain IDs: 8453, 10, 1
  → at chainId
`);
      });

      it("should not decode encoded LSL when chainId value is out of bounds (too large)", () => {
        const encodedLsl =
          "0x0101000000000000000000000000000000000000000000000000002000000000000041aa48ef3c0446b46a5b1cc6337ff3d3716e2a33073b78bf041b622ff5f1b972b5839062cbe5ab0efb4917745873e00305d7c0cb";

        expect(() =>
          decodeListStorageLocationContract("mainnet", encodedLsl),
        ).toThrowError(`Failed to decode the encoded List Storage Location contract object: 
✖ chainId must be a positive safe integer value
  → at chainId
✖ chainId must be one of the EFP deployment Chain IDs: 8453, 10, 1
  → at chainId
`);
      });

      it("should not decode encoded LSL when chainId value is not allowlisted", () => {
        const encodedLsl =
          "0x0101000000000000000000000000000000000000000000000000001fffffffffffff41aa48ef3c0446b46a5b1cc6337ff3d3716e2a33073b78bf041b622ff5f1b972b5839062cbe5ab0efb4917745873e00305d7c0cb";

        expect(() =>
          decodeListStorageLocationContract("mainnet", encodedLsl),
        ).toThrowError(`Failed to decode the encoded List Storage Location contract object: 
✖ chainId must be one of the EFP deployment Chain IDs: 8453, 10, 1
  → at chainId
`);
      });

      it("should not decode encoded LSL when `version` is different than 1", () => {
        const encodedLsl =
          "0x020100000000000000000000000000000000000000000000000000000000000000015289fe5dabc021d02fddf23d4a4df96f4e0f17ef469e5ab72064e89164e9792a7f05d5bc073c2dfb1bb6da7b801e1bb2192808cc";

        expect(() => decodeListStorageLocationContract("mainnet", encodedLsl)).toThrowError(
          `Failed to decode the encoded List Storage Location contract object: 
✖ Invalid input: expected "01"
  → at version`,
        );
      });

      it("should not decode encoded LSL when `type` field is different than 1", () => {
        const encodedLsl =
          "0x010200000000000000000000000000000000000000000000000000000000000000015289fe5dabc021d02fddf23d4a4df96f4e0f17ef469e5ab72064e89164e9792a7f05d5bc073c2dfb1bb6da7b801e1bb2192808cc";

        expect(() => decodeListStorageLocationContract("mainnet", encodedLsl)).toThrowError(
          `Encoded List Storage Location type value for an EVMContract LSL must be set to 01`,
        );
      });

      it("should not decode encoded LSL when the value is not of the right length", () => {
        const encodedLsl = "0xa22cb465";

        expect(() => decodeListStorageLocationContract("mainnet", encodedLsl)).toThrowError(
          `Encoded List Storage Location values for a LSL v1 Contract must be a 174-character long string`,
        );
      });
    });
  });
});
