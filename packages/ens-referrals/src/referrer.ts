import { type Address, bytesToHex, type Hex, hexToBytes, pad, zeroAddress } from "viem";

/**
 * Encoded Referrer
 *
 * Guaranteed to be a string representation of 32-bytes.
 */
export type EncodedReferrer = Hex;

/**
 * Build an {@link EncodedReferrer} value from a given {@link Address}.
 */
export function buildEncodedReferrer(address: Address): EncodedReferrer {
  const normalizedAddress = address.toLowerCase() as Address;

  return pad(normalizedAddress, { size: 32 });
}

/**
 * Decode an {@link EncodedReferrer} value into an {@link Address}.
 *
 * @param encodedReferrer - The raw referrer value to decode.
 * @returns The decoded referrer address.
 */
export function decodeEncodedReferrer(encodedReferrer: Hex): Address {
  const rawReferrerBytes = hexToBytes(encodedReferrer);

  if (rawReferrerBytes.length !== 32) {
    return zeroAddress;
  }

  const initialBytes = rawReferrerBytes.slice(0, 12);
  const areAllInitialBytesZero = initialBytes.every((byte) => byte === 0);

  if (!areAllInitialBytesZero) {
    return zeroAddress;
  }

  const remainingBytes = rawReferrerBytes.slice(12, 32);
  const referrerAddress = bytesToHex(remainingBytes).toLowerCase() as Address;

  return referrerAddress;
}

/**
 * Build a referrer URL for a given {@link Address}.
 *
 * @returns a special URL to ENS App website including referrer data.
 */
export function buildReferrerUrl(address: Address): URL {
  const ensAppUrl = new URL("https://app.ens.domains");

  ensAppUrl.searchParams.set("referrer", address);

  return ensAppUrl;
}
