import type { UnixTimestamp } from "@ensnode/ensnode-sdk";
import type { Address } from "viem";

/**
 * Data associated with a Registration
 */
export interface Registration {
  /**
   * Timestamp when the registration occurred.
   */
  registeredAt: UnixTimestamp;

  /**
   * Timestamp when the registration is scheduled to expire.
   */
  expiresAt: UnixTimestamp;

  /**
   * The registered ENS name
   */
  name: string;

  /**
   * The "official" owner of the domain in the ENS Registry.
   */
  ownerInRegistry: Address;

  /**
   * The owner of the domain according to the ENS NameWrapper.
   * If undefined, the domain associated with the registration is unwrapped (not in the ENS NameWrapper).
   */
  ownerInNameWrapper?: Address;

  /**
   * Effective owner of the registered domain.
   * Considers both ownerInRegistry and ownerInNameWrapper to determine the "effective" owner on a practical basis.
   */
  owner: Address;
}
