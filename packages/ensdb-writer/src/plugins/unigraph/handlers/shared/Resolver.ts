import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../../adapter";
import { ensureEvent, ensureResolverEvent } from "../../../../lib/ensv2/event-db-helpers";
import { getThisAccountId } from "../../../../lib/get-this-account-id";
import { namespaceContract } from "../../../../lib/namespace-contract";
import type { IndexingEngineContext, LogEventBase } from "../../../../types";

const pluginName = PluginName.Unigraph;

/**
 * Handlers for Resolver contracts in the 'unigraph' plugin. Note that the 'protocol-acceleration' plugin
 * handles most indexing behavior, these additional indexing functions:
 *
 * - ensure that the event for the Resolver is indexed
 */
export default function (adapter: IndexingEngineAdapter) {
  async function handleResolverEvent({
    context,
    event,
  }: {
    context: IndexingEngineContext;
    event: LogEventBase;
  }) {
    const resolver = getThisAccountId(context, event);
    const eventId = await ensureEvent(context, event);
    await ensureResolverEvent(context, resolver, eventId);
  }

  adapter.on(namespaceContract(pluginName, "Resolver:AddrChanged"), handleResolverEvent);
  adapter.on(namespaceContract(pluginName, "Resolver:AddressChanged"), handleResolverEvent);
  adapter.on(namespaceContract(pluginName, "Resolver:NameChanged"), handleResolverEvent);
  adapter.on(namespaceContract(pluginName, "Resolver:ContenthashChanged"), handleResolverEvent);
  adapter.on(namespaceContract(pluginName, "Resolver:ABIChanged"), handleResolverEvent);
  adapter.on(namespaceContract(pluginName, "Resolver:PubkeyChanged"), handleResolverEvent);
  adapter.on(namespaceContract(pluginName, "Resolver:InterfaceChanged"), handleResolverEvent);
  adapter.on(namespaceContract(pluginName, "Resolver:AuthorisationChanged"), handleResolverEvent);
  adapter.on(namespaceContract(pluginName, "Resolver:VersionChanged"), handleResolverEvent);
  adapter.on(namespaceContract(pluginName, "Resolver:DNSRecordDeleted"), handleResolverEvent);

  adapter.on(
    namespaceContract(
      pluginName,
      "Resolver:TextChanged(bytes32 indexed node, string indexed indexedKey, string key)",
    ),
    handleResolverEvent,
  );

  adapter.on(
    namespaceContract(
      pluginName,
      "Resolver:TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value)",
    ),
    handleResolverEvent,
  );

  adapter.on(
    namespaceContract(
      pluginName,
      "Resolver:DNSRecordChanged(bytes32 indexed node, bytes name, uint16 resource, bytes record)",
    ),
    handleResolverEvent,
  );

  adapter.on(
    namespaceContract(
      pluginName,
      "Resolver:DNSRecordChanged(bytes32 indexed node, bytes name, uint16 resource, uint32 ttl, bytes record)",
    ),
    handleResolverEvent,
  );
}
