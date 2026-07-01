import { ENS_ROOT_NODE, makeSubdomainNode, type Node } from "enssdk";

import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../../../adapter";
import { namespaceContract } from "../../../../../lib/namespace-contract";
import { setupRootNode } from "../../../../../lib/subgraph/subgraph-helpers";
import { ensIndexerSchema } from "../../../../../schema";
import type { IndexingEngineContext } from "../../../../../types";
import {
  handleNewOwner,
  handleNewResolver,
  handleNewTTL,
  handleTransfer,
} from "../../../shared-handlers/Registry";

// NOTE: Due to a security issue, ENS migrated from an old registry contract to a new registry
// contract. When indexing events, the indexer ignores any events on the old regsitry for domains
// that have been migrated to the new registry. We encode this logic in this file, ignoring
// RegistryOld events when the domain in question has already been registered in or migrated to the
// (new) Registry.

// these handlers should ignore 'RegistryOld' events for a given domain if it has been migrated to the
// (new) Registry, which is tracked in the `Domain.isMigrated` field
async function shouldIgnoreRegistryOldEvents(context: IndexingEngineContext, node: Node) {
  const domain = await context.ensDb.find(ensIndexerSchema.subgraph_domain, { id: node });
  return domain?.isMigrated ?? false;
}

/**
 * Registers event handlers with Ponder.
 */
export default function (adapter: IndexingEngineAdapter) {
  const pluginName = PluginName.Subgraph;

  adapter.on(namespaceContract(pluginName, "ENSv1RegistryOld:setup"), setupRootNode);

  // old registry functions are proxied to the current handlers
  // iff the domain has not yet been migrated
  adapter.on(
    namespaceContract(pluginName, "ENSv1RegistryOld:NewOwner"),
    async ({ context, event }) => {
      const { label: labelHash, node: parentNode } = event.args;

      const node = makeSubdomainNode(labelHash, parentNode);
      const shouldIgnoreEvent = await shouldIgnoreRegistryOldEvents(context, node);
      if (shouldIgnoreEvent) return;

      return handleNewOwner(false)({ context, event });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "ENSv1RegistryOld:NewResolver"),
    async ({ context, event }) => {
      const shouldIgnoreEvent = await shouldIgnoreRegistryOldEvents(context, event.args.node);
      const isRootNode = event.args.node === ENS_ROOT_NODE;

      // inverted logic of https://github.com/ensdomains/ens-subgraph/blob/c844791/src/ensRegistry.ts#L246
      // NOTE: the subgraph must include an exception here for the root node because it starts out
      // shouldIgnoreEvent: true, but we definitely still want to handle NewResolver events for it.
      if (shouldIgnoreEvent && !isRootNode) return;

      return handleNewResolver({ context, event });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "ENSv1RegistryOld:NewTTL"),
    async ({ context, event }) => {
      const shouldIgnoreEvent = await shouldIgnoreRegistryOldEvents(context, event.args.node);
      if (shouldIgnoreEvent) return;

      return handleNewTTL({ context, event });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "ENSv1RegistryOld:Transfer"),
    async ({ context, event }) => {
      // NOTE: this logic derived from the subgraph introduces a minor bug for queries with a blockheight
      // below 9380380, when the new Registry was deployed, as it implicitly ignores Transfer events
      // of the ENS_ROOT_NODE. as a result, the root node's owner is always zeroAddress until the new
      // Registry events are picked up. for backwards compatibility this behavior is re-implemented
      // here.

      const shouldIgnoreEvent = await shouldIgnoreRegistryOldEvents(context, event.args.node);
      if (shouldIgnoreEvent) return;

      return handleTransfer({ context, event });
    },
  );

  adapter.on(namespaceContract(pluginName, "ENSv1Registry:NewOwner"), handleNewOwner(true));
  adapter.on(namespaceContract(pluginName, "ENSv1Registry:NewResolver"), handleNewResolver);
  adapter.on(namespaceContract(pluginName, "ENSv1Registry:NewTTL"), handleNewTTL);
  adapter.on(namespaceContract(pluginName, "ENSv1Registry:Transfer"), handleTransfer);
}
