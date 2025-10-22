import { bytesToHex, hexToBytes, zeroAddress } from "viem";
import { asLowerCaseAddress } from "../shared";
import type { InterpretedReferrer, RawReferrer } from "./types";

/**
 * Interprets a raw referrer value into an {@link InterpretedReferrer}.
 *
 * @param rawReferrer - The raw referrer value to interpret.
 * @returns The interpreted referrer.
 */
export function interpretRawReferrer(rawReferrer: RawReferrer): InterpretedReferrer {
  const rawReferrerBytes = hexToBytes(rawReferrer);

  const initialBytes = rawReferrerBytes.slice(0, 12);
  const areAllInitialBytesZero = initialBytes.every((byte) => byte === 0);

  if (areAllInitialBytesZero) {
    const remainingBytes = rawReferrerBytes.slice(12, 32);

    return asLowerCaseAddress(bytesToHex(remainingBytes));
  }

  return zeroAddress;
}
