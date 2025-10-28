import type { Address } from "viem";

import type { EncodedReferrer } from "@ensnode/ens-referrals";

import type { Node } from "../ens";
import type { Duration, EventRef, Price } from "../shared";

export const RegistrarActionTypes = {
  Registration: "registration",
  Renewal: "renewal",
} as const;

export type RegistrarActionType = (typeof RegistrarActionTypes)[keyof typeof RegistrarActionTypes];

/**
 * Registrar Action
 */
export interface RegistrarAction extends EventRef {
  /**
   * Type of registrar action
   */
  type: RegistrarActionType;

  /**
   * Node
   *
   * Node for the name associated with the registrar action.
   */
  node: Node;

  /**
   * Base cost
   */
  baseCost: Price;

  /**
   * Premium
   */
  premium: Price;

  /**
   * Total cost of preforming the registrar action.
   *
   * Sum of `baseCost` and `premium`.
   */
  total: Price;

  /**
   * Incremental Duration
   *
   * Definition of "incremental duration" is
   * The incremental increase in the lifespan of the registration for
   * `node` that was active as of `timestamp`.
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
   * Guaranteed to be a non-negative bigint value.
   */
  incrementalDuration: Duration;

  /**
   * Registrant
   *
   * Account that initiated the registrarAction and is paying the "total".
   * Note: the "total.amount" may be`0` or more.
   */
  registrant: Address;

  /**
   * Encoded Referrer
   *
   * A 32-bytes value.
   */
  encodedReferrer: EncodedReferrer;

  /**
   * Decoded Referrer
   *
   * Invariants:
   * - If the first `12`-bytes of "encodedReferrer" are all `0`,
   *   then "decodedReferrer" is the last `20`-bytes of "encodedReferrer",
   *   else: "decodedReferrer" is the zero address.
   */
  decodedReferrer: Address;
}
