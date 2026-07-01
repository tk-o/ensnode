import { makeENSv2DomainId, makeStorageId, type NormalizedAddress } from "enssdk";

import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../adapter";
import { getThisAccountId } from "../../../lib/get-this-account-id";
import { namespaceContract } from "../../../lib/namespace-contract";
import { ensureDomainResolverRelation } from "../../../lib/protocol-acceleration/domain-resolver-relationship-db-helpers";
import type { EventWithArgs, IndexingEngineContext } from "../../../types";

const pluginName = PluginName.ProtocolAcceleration;

export default function (adapter: IndexingEngineAdapter) {
  adapter.on(
    namespaceContract(pluginName, "ENSv2Registry:ResolverUpdated"),
    async ({
      context,
      event,
    }: {
      context: IndexingEngineContext;
      event: EventWithArgs<{
        tokenId: bigint;
        resolver: NormalizedAddress;
      }>;
    }) => {
      const { tokenId, resolver } = event.args;

      const registry = getThisAccountId(context, event);
      const storageId = makeStorageId(tokenId);
      const domainId = makeENSv2DomainId(registry, storageId);

      await ensureDomainResolverRelation(context, registry, domainId, resolver);
    },
  );
}
