/**
 * Shared Helpers for managing Registrar Action entities, usable by any contract that wishes to track
 * registrations and renewals information.
 */

import { decodeEncodedReferrer, type EncodedReferrer } from "@namehash/ens-referrals";
import type { Address, Hash } from "viem";

import {
  type ChainId,
  type CurrencyId,
  type Duration,
  deserializeDuration,
  type Node,
  type RegistrarAction,
  type RegistrarActionType,
  type UnixTimestamp,
} from "@ensnode/ensnode-sdk";

import type { SubregistryRegistration } from "@/lib/registrars/registration";

/**
 * Get the incremental duration for Registration action.
 *
 * @param registrationWillExpireAt The timestamp that is about to replace
 *        the `expiresAt` field of the `currentRegistration`.
 * @param currentBlockTimestamp The current block timestamp.
 */
export function getIncrementalDurationForRegistration(
  registrationWillExpireAt: UnixTimestamp,
  currentBlockTimestamp: UnixTimestamp,
): Duration {
  return deserializeDuration(registrationWillExpireAt - currentBlockTimestamp);
}

/**
 * Get the incremental duration for Renewal action.
 *
 * Definition of "incremental duration" is
 * the incremental increase in the lifespan of a registration.
 *
 * Please consider the following situation:
 *
 * A registration of direct subname of .eth is scheduled to expire on
 * Jan 1, midnight UTC. It is currently 30 days after this expiration time.
 * Therefore, there are currently another 60 days of grace period remaining
 * for this name. Anyone can now make a renewal of this name.
 *
 * There are two possible scenarios when a renewal is made:
 *
 * 1) If a renewal is made for 10 days incremental duration,
 *    this name remains in an "expired" state, but it now
 *    has another 70 days of grace period remaining.
 *
 * 2) If a renewal is made for 50 days incremental duration,
 *    this name is no longer "expired" and is active, but it now
 *    expires in 20 days.
 *
 * After the latest registration of a direct subname becomes expired by
 * more than the grace period, it can no longer be renewed by anyone.
 * It must first be registered again, starting a new registration lifecycle of
 * expiry / grace period / etc.
 *
 * @param registrationWillExpireAt The timestamp that is about to replace
 *        the `expiresAt` field of the `currentRegistration`.
 * @param currentRegistration The current indexed registration.
 *
 * @returns incremental duration in seconds.
 * @throws if no related Registration was indexed before.
 */
export function getIncrementalDurationForRenewal(
  registrationWillExpireAt: UnixTimestamp,
  currentRegistration: SubregistryRegistration,
): Duration {
  // Calculate and return the incremental duration
  return deserializeDuration(registrationWillExpireAt - currentRegistration.expiresAt);
}

export function buildSubregistryRegistrarAction(
  {
    chainId,
    timestamp,
    transactionHash,
    logIndex,
  }: {
    chainId: ChainId;
    timestamp: bigint;
    transactionHash: Hash;
    logIndex: number;
  },
  {
    type,
    node,
    baseCost,
    premium,
    registrant,
    encodedReferrer,
    incrementalDuration,
  }: {
    type: RegistrarActionType;
    node: Node;
    expiresAt: bigint;
    baseCost: bigint;
    premium: bigint;
    registrant: Address;
    encodedReferrer: EncodedReferrer;
    incrementalDuration: Duration;
  },
  currency: CurrencyId,
): RegistrarAction {
  // 0. Calculate total cost
  const total = baseCost + premium;

  // 1. Decode the encoded referrer
  //    Note: the result address is checksummed, so we turn it lowercase
  const decodedReferrer = decodeEncodedReferrer(encodedReferrer).toLowerCase() as Address;

  return {
    type,
    node,
    baseCost: {
      amount: baseCost,
      currency,
    },
    premium: {
      amount: premium,
      currency,
    },
    total: {
      amount: total,
      currency,
    },
    incrementalDuration,
    registrant,
    encodedReferrer,
    decodedReferrer,
    chainId,
    timestamp: Number(timestamp),
    transactionHash,
    logIndex,
  };
}
