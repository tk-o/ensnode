import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../../../adapter";
import { namespaceContract } from "../../../../../lib/namespace-contract";
import { setupRootNode } from "../../../../../lib/subgraph/subgraph-helpers";
import {
  handleNewOwner,
  handleNewResolver,
  handleNewTTL,
  handleTransfer,
} from "../../../shared-handlers/Registry";

/**
 * Registers event handlers with Ponder.
 */
export default function (adapter: IndexingEngineAdapter) {
  const pluginName = PluginName.Basenames;

  adapter.on(namespaceContract(pluginName, "Registry:setup"), setupRootNode);
  adapter.on(namespaceContract(pluginName, "Registry:NewOwner"), handleNewOwner(true));
  adapter.on(namespaceContract(pluginName, "Registry:NewResolver"), handleNewResolver);
  adapter.on(namespaceContract(pluginName, "Registry:NewTTL"), handleNewTTL);
  adapter.on(namespaceContract(pluginName, "Registry:Transfer"), handleTransfer);
}
