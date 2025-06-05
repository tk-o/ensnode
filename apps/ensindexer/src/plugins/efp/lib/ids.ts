/**
 * Makes a unique EFP List Storage Location ID.
 *
 * @example `${chainId}-${listRecordsAddress}-${slot}`
 *
 * @param chainId the chain ID
 * @param address the resolver contract address
 * @param node the ENS node
 * @returns a unique resolver ID
 */

import type { Address } from "viem";

export const makeListStorageLocationId = (
  chainId: number,
  listRecordsAddress: Address,
  slot: bigint,
) => `${chainId}-${listRecordsAddress}-${slot.toString()}`;
