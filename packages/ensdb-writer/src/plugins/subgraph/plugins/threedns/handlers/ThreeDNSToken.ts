import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../../../adapter";
import { namespaceContract } from "../../../../../lib/namespace-contract";
import { setupRootNode } from "../../../../../lib/subgraph/subgraph-helpers";
import {
  handleNewOwner,
  handleRegistrationCreated,
  handleRegistrationExtended,
  handleTransfer,
} from "../../../shared-handlers/ThreeDNSToken";

/**
 * Registers event handlers with Ponder.
 */
export default function (adapter: IndexingEngineAdapter) {
  const pluginName = PluginName.ThreeDNS;

  adapter.on(namespaceContract(pluginName, "ThreeDNSToken:setup"), setupRootNode);
  adapter.on(namespaceContract(pluginName, "ThreeDNSToken:NewOwner"), handleNewOwner);
  adapter.on(namespaceContract(pluginName, "ThreeDNSToken:Transfer"), handleTransfer);
  adapter.on(
    namespaceContract(pluginName, "ThreeDNSToken:RegistrationCreated"),
    handleRegistrationCreated,
  );
  adapter.on(
    namespaceContract(pluginName, "ThreeDNSToken:RegistrationExtended"),
    handleRegistrationExtended,
  );
}
