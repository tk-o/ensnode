import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../adapter";
import { getThisAccountId } from "../../../lib/get-this-account-id";
import { namespaceContract } from "../../../lib/namespace-contract";
import { handleResolverImplementationChange } from "../../../lib/protocol-acceleration/resolver-db-helpers";

const pluginName = PluginName.ProtocolAcceleration;

/**
 * Handlers for any Resolvers that are UpgradeableProxies, necessary for tracking implementation updates.
 */
export default function (adapter: IndexingEngineAdapter) {
  adapter.on(
    namespaceContract(pluginName, "UpgradeableProxyResolver:Upgraded"),
    async ({ context, event }) => {
      const resolver = getThisAccountId(context, event);
      await handleResolverImplementationChange(context, resolver);
    },
  );
}
