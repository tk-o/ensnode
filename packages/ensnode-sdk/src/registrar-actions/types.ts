import { Address, ByteArray, Hash } from "viem";
import { Node } from "../ens";
import { ChainId, Cost, UnixTimestamp } from "../shared";

export const RegistrarActionType = {
  Registration: "registration",
  Renewal: "renewal",
} as const;

export type RegistrarActionTypes = (typeof RegistrarActionType)[keyof typeof RegistrarActionType];

/**
 * Raw Referrer
 *
 * Guaranteed to be 32-bytes.
 */
export type RawReferrer = ByteArray;

/**
 * Interpreted Referred
 *
 * Value interpreted from {@link RawReferrer}.
 */
export type InterpretedReferrer = Address;

/**
 * Registrar Action
 */
export interface RegistrarAction {
  /**
   * Type of registrar action
   */
  type: RegistrarActionTypes;

  /**
   * Node
   *
   * Node for which registrar action was executed.
   */
  node: Node;

  /**
   * Base cost
   *
   * Guaranteed to be a non-negative value.
   */
  baseCost: Cost;

  /**
   * Premium
   *
   * Guaranteed to be a non-negative value.
   */
  premium: Cost;

  /**
   * Total cost of preforming the registrar action.
   *
   * Sum of `baseCost` and `premium`.
   *
   * Guaranteed to be a non-negative value.
   */
  total: Cost;

  /**
   * Registrant
   *
   * Account that initiated the registrarAction and is paying the "total".
   * Note: the “total” may be`0` or more.
   */
  registrant: Address;

  /**
   * Raw Referrer
   *
   * A 32-bytes value.
   */
  rawReferrer: RawReferrer;

  /**
   * Interpreted Referrer
   *
   * Invariants:
   * - If the first `12`-bytes of “rawReferrer” are all `0`,
   *   then “interpretedReferrer” is the last `20`-bytes of “rawReferrer”,
   *   else: “interpretedReferrer” is the zero address.
   */
  interpretedReferrer: InterpretedReferrer;

  /**
   * Block timestamp
   */
  blockTimestamp: UnixTimestamp;

  /**
   * Chain ID
   */
  chainId: ChainId;

  /**
   * Transaction Hash
   */
  transactionHash: Hash;
}
