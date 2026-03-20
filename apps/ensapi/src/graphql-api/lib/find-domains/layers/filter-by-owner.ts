import { eq } from "drizzle-orm";
import type { Address } from "viem";

import { ensDbReader } from "@/lib/ensdb/singleton";

const db = ensDbReader.client;

import { type BaseDomainSet, selectBase } from "./base-domain-set";

/**
 * Filter a base domain set by owner address.
 */
export function filterByOwner(base: BaseDomainSet, owner: Address) {
  return db //
    .select(selectBase(base))
    .from(base)
    .where(eq(base.ownerId, owner))
    .as("baseDomains");
}
