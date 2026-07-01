import type { Address, ENSv1DomainId } from "enssdk";

import { interpretAddress } from "@ensnode/ensnode-sdk";

import { ensIndexerSchema } from "../../schema";
import type { IndexingEngineContext } from "../../types";
import { ensureAccount } from "./account-db-helpers";

/**
 * Sets an ENSv1 Domain's effective owner to `owner`.
 */
export async function materializeENSv1DomainEffectiveOwner(
  context: IndexingEngineContext,
  id: ENSv1DomainId,
  owner: Address,
) {
  // ensure owner
  await ensureAccount(context, owner);

  // update Domain's effective owner
  await context.ensDb
    .update(ensIndexerSchema.domain, { id })
    .set({ ownerId: interpretAddress(owner) });
}
