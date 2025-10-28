import { type Address, bytesToHex, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";

import { buildEncodedReferrer, buildReferrerUrl, decodeEncodedReferrer } from "./referrer";

const vitalikEthAddress: Address = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
const vitalikEthAddressChecksummed: Address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

describe("encoded referrer", () => {
  describe("decoding a 32-byte value", () => {
    it("returns the EVM address when initial bytes were all zeroes", () => {
      // arrange
      const initialBytes = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

      const remainingBytes = new Uint8Array([
        216, 218, 107, 242, 105, 100, 175, 157, 126, 237, 158, 3, 229, 52, 21, 211, 122, 169, 96,
        69,
      ]);

      const input = bytesToHex(new Uint8Array([...initialBytes, ...remainingBytes]));

      // act
      const result = decodeEncodedReferrer(input);

      // assert
      expect(result).toEqual(vitalikEthAddress);
    });

    it("returns a zero address when initial bytes were not all zeroes", () => {
      // arrange
      const initialBytes = new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

      const remainingBytes = new Uint8Array([
        216, 218, 107, 242, 105, 100, 175, 157, 126, 237, 158, 3, 229, 52, 21, 211, 122, 169, 96,
        69,
      ]);

      const input = bytesToHex(new Uint8Array([...initialBytes, ...remainingBytes]));

      // act
      const result = decodeEncodedReferrer(input);

      // assert
      expect(result).toEqual(zeroAddress);
    });
  });

  describe("decoding a non-32-byte value", () => {
    it("returns a zero address", () => {
      expect(decodeEncodedReferrer("0x")).toEqual(zeroAddress);
    });
  });

  describe("building encoded referrer", () => {
    it("returns encoded referrer for a lowercase EVM address", () => {
      const address = vitalikEthAddress;
      const encodedReferrer = buildEncodedReferrer(vitalikEthAddress);
      const decodedReferrer = decodeEncodedReferrer(encodedReferrer);

      expect(address).toStrictEqual(decodedReferrer);
      expect(encodedReferrer).toEqual(`0x000000000000000000000000${address.slice(2)}`);

      expect(buildEncodedReferrer(vitalikEthAddress)).toEqual(
        `0x000000000000000000000000${vitalikEthAddress.slice(2)}`,
      );
    });

    it("returns encoded referrer for a checksummed EVM address", () => {
      const address = vitalikEthAddress;
      const encodedReferrer = buildEncodedReferrer(vitalikEthAddressChecksummed);
      const decodedReferrer = decodeEncodedReferrer(encodedReferrer);

      expect(address).toStrictEqual(decodedReferrer);
      expect(encodedReferrer).toEqual(`0x000000000000000000000000${address.slice(2)}`);

      expect(buildEncodedReferrer(vitalikEthAddressChecksummed)).toEqual(
        `0x000000000000000000000000${vitalikEthAddressChecksummed.toLowerCase().slice(2)}`,
      );
    });
  });

  describe("building a referrer URL", () => {
    it("can build a referrer URL to ENS App", () => {
      expect(buildReferrerUrl(vitalikEthAddress).toString()).toStrictEqual(
        `https://app.ens.domains/?referrer=${vitalikEthAddress}`,
      );
    });
  });
});
