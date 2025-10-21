import { bytesToHex, zeroAddress } from "viem";
import { asLowerCaseAddress } from "../shared";
import { InterpretedReferrer, RawReferrer } from "./types";

export function interpretRawReferrer(rawReferrer: RawReferrer): InterpretedReferrer {
  const initialBytes = rawReferrer.slice(0, 12);
  const areAllInitialBytesZeroes = initialBytes.every((byte) => byte === 0);

  if (areAllInitialBytesZeroes) {
    const remainingBytes = rawReferrer.slice(12, 32);
    const interpretedReferrer = asLowerCaseAddress(bytesToHex(remainingBytes));

    return interpretedReferrer;
  }

  return zeroAddress;
}
