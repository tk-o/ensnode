import { Hex } from "viem";
import { SerializedCost } from "../shared";
import type { RawReferrer, RegistrarAction } from "./types";

/**
 * Serialized representation of {@link RawReferrer}
 */
export type SerializedRawReferrer = Hex;

/**
 * Serialized representation of {@link RegistrarAction}.
 */
export interface SerializedRegistrarAction
  extends Omit<RegistrarAction, "baseCost" | "premium" | "total" | "rawReferrer"> {
  /**
   * Base cost
   *
   * Represents a non-negative bigint.
   */
  baseCost: SerializedCost;

  /**
   * Premium
   *
   * Represents a non-negative bigint.
   */
  premium: SerializedCost;

  /**
   * Total cost of preforming the registrar action.
   *
   * Sum of `baseCost` and `premium`.
   *
   * Represents a non-negative bigint.
   */
  total: SerializedCost;

  /**
   * Raw Referrer
   *
   * Represents a 32-bytes value.
   */
  rawReferrer: SerializedRawReferrer;
}
