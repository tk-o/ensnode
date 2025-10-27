import { type Address, bytesToHex, hexToBytes, zeroAddress } from "viem";

import { asLowerCaseAddress } from "../shared";
import type { EncodedReferrer } from "./types";

/**
 * Decodes an {@link EncodedReferrer} value into an {@link Address}.
 *
 * @param encodedReferrer - The raw referrer value to decode.
 * @returns The decoded referrer.
 */
export function decodeReferrer(encodedReferrer: EncodedReferrer): Address {
  const rawReferrerBytes = hexToBytes(encodedReferrer);

  const initialBytes = rawReferrerBytes.slice(0, 12);
  const areAllInitialBytesZero = initialBytes.every((byte) => byte === 0);

  if (!areAllInitialBytesZero) {
    return zeroAddress;
  }

  const remainingBytes = rawReferrerBytes.slice(12, 32);

  return asLowerCaseAddress(bytesToHex(remainingBytes));
}
