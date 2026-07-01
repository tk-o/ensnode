import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../../../adapter";
import { namespaceContract } from "../../../../../lib/namespace-contract";
import { makeNameWrapperHandlers } from "../../../shared-handlers/NameWrapper";

/**
 * Registers event handlers with Ponder.
 */
export default function (adapter: IndexingEngineAdapter) {
  const pluginName = PluginName.Lineanames;

  const {
    handleNameWrapped,
    handleNameUnwrapped,
    handleFusesSet,
    handleExpiryExtended,
    handleTransferSingle,
    handleTransferBatch,
  } = makeNameWrapperHandlers();

  adapter.on(namespaceContract(pluginName, "NameWrapper:NameWrapped"), handleNameWrapped);
  adapter.on(namespaceContract(pluginName, "NameWrapper:NameUnwrapped"), handleNameUnwrapped);
  adapter.on(namespaceContract(pluginName, "NameWrapper:FusesSet"), handleFusesSet);
  adapter.on(namespaceContract(pluginName, "NameWrapper:ExpiryExtended"), handleExpiryExtended);
  adapter.on(namespaceContract(pluginName, "NameWrapper:TransferSingle"), handleTransferSingle);
  adapter.on(namespaceContract(pluginName, "NameWrapper:TransferBatch"), handleTransferBatch);
}
