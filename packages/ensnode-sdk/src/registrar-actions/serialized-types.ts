import type { SerializedCost } from "../shared";
import type { RegistrarAction } from "./types";

/**
 * Serialized representation of {@link RegistrarAction}.
 */
export interface SerializedRegistrarAction
  extends Omit<RegistrarAction, "baseCost" | "premium" | "total"> {
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
}
