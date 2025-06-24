import { parseEvmAddress } from "@/plugins/efp/lib/utils";
import { describe, expect, it } from "vitest";

describe("EFP utils", () => {
  describe("normalizeAddress", () => {
    it("should parse a valid EVM address", () => {
      const evmAddress = "0x5289fE5daBC021D02FDDf23d4a4DF96F4E0F17EF";

      expect(parseEvmAddress(evmAddress)).toBe("0x5289fe5dabc021d02fddf23d4a4df96f4e0f17ef");
    });

    it("should throw an error for an invalid EVM address", () => {
      const invalidEvmAddress = "0x12345";

      expect(() => parseEvmAddress(invalidEvmAddress)).toThrowError(`Address "0x12345" is invalid.

- Address must be a hex value of 20 bytes (40 hex characters).
- Address must match its checksum counterpart.`);
    });
  });
});
