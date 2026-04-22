import type { DomainId } from "enssdk";

import ensApiContext from "@/context";

export async function getDomainResolver(domainId: DomainId) {
  const { ensDb } = ensApiContext;
  const drr = await ensDb.query.domainResolverRelation.findFirst({
    where: (t, { eq }) => eq(t.domainId, domainId),
    with: { resolver: true },
  });

  return drr?.resolver;
}
