import { eq } from "drizzle-orm";
import type { NormalizedAddress } from "enssdk";

import di from "@/di";

import { type BaseDomainSet, selectBase } from "./base-domain-set";

/**
 * Filter a base domain set by owner address.
 */
export function filterByOwner(base: BaseDomainSet, owner: NormalizedAddress) {
  const { ensDb } = di.context;
  return ensDb //
    .select(selectBase(base))
    .from(base)
    .where(eq(base.ownerId, owner))
    .as("baseDomains");
}
