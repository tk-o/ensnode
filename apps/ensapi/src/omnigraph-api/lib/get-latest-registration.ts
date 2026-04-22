import type { DomainId } from "enssdk";

import ensApiContext from "@/context";

/**
 * Gets the latest Registration entity for Domain `domainId`.
 */
export async function getLatestRegistration(domainId: DomainId) {
  const { ensDb } = ensApiContext;
  return await ensDb.query.registration.findFirst({
    where: (t, { eq }) => eq(t.domainId, domainId),
    orderBy: (t, { desc }) => desc(t.registrationIndex),
  });
}
