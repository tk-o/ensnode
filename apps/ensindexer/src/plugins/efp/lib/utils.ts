import { type Address, getAddress } from "viem";

/**
 * EVM Address type.
 *
 * Represents a normalized EVM address, which is always in lowercase.
 * This type is used to ensure that EVM addresses are consistently formatted.
 *
 * Note: To prevent any `Address` value from being able to be represented as an EvmAddress, we apply a brand to the type.
 */
export type EvmAddress = Address & { __brand: "EvmAddress" };

/**
 * Parses an EVM address value.
 *
 * @param {string} value - The EVM address string to parse.
 * @returns {EvmAddress} The normalized EVM address in lowercase.
 */
export function parseEvmAddress(value: string): EvmAddress {
  return getAddress(value).toLowerCase() as EvmAddress;
}
