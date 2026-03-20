import type { DomainId } from "@ensnode/ensnode-sdk";

import { ensDbReader } from "@/lib/ensdb/singleton";

const db = ensDbReader.client;

export async function getDomainResolver(domainId: DomainId) {
  const drr = await db.query.domainResolverRelation.findFirst({
    where: (t, { eq }) => eq(t.domainId, domainId),
    with: { resolver: true },
  });

  return drr?.resolver;
}
