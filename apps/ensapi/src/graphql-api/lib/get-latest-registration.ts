import type { DomainId } from "@ensnode/ensnode-sdk";

import { ensDbReader } from "@/lib/ensdb/singleton";

const db = ensDbReader.client;

/**
 * Gets the latest Registration entity for Domain `domainId`.
 */
export async function getLatestRegistration(domainId: DomainId) {
  return await db.query.registration.findFirst({
    where: (t, { eq }) => eq(t.domainId, domainId),
    orderBy: (t, { desc }) => desc(t.index),
  });
}
