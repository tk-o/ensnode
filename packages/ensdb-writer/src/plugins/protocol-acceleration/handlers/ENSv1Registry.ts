import { makeENSv1DomainId, type Node, type NormalizedAddress } from "enssdk";

import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../adapter";
import { getThisAccountId } from "../../../lib/get-this-account-id";
import { getManagedName } from "../../../lib/managed-names";
import { namespaceContract } from "../../../lib/namespace-contract";
import { ensureDomainResolverRelation } from "../../../lib/protocol-acceleration/domain-resolver-relationship-db-helpers";
import { nodeIsMigrated } from "../../../lib/protocol-acceleration/migrated-node-db-helpers";
import type { EventWithArgs, IndexingEngineContext } from "../../../types";

/**
 * Handler functions for Registry contracts in the Protocol Acceleration plugin.
 * - indexes Node-Resolver Relationships for all Registry contracts
 *
 * Note: ENS Root Chain Registry node-migration status is tracked separately in `node-migration.ts`,
 * registered before both this plugin and the 'unigraph' plugin so its results are available to the
 * Old-registry guards in either plugin.
 */
export default function (adapter: IndexingEngineAdapter) {
  async function handleNewResolver({
    context,
    event,
  }: {
    context: IndexingEngineContext;
    event: EventWithArgs<{ node: Node; resolver: NormalizedAddress }>;
  }) {
    const { node, resolver } = event.args;

    // Canonicalize to the concrete ENSv1 Registry that governs this contract's namegraph
    // (ENSv1Registry vs. ENSv1RegistryOld both canonicalize to ENSv1Registry)
    const { registry } = getManagedName(context.namespace, getThisAccountId(context, event));
    const domainId = makeENSv1DomainId(registry, node);

    await ensureDomainResolverRelation(context, registry, domainId, resolver);
  }

  /**
   * Handles Registry#NewResolver for:
   * - ENS Root Chain's ENSv1RegistryOld
   */
  adapter.on(
    namespaceContract(PluginName.ProtocolAcceleration, "ENSv1RegistryOld:NewResolver"),
    async ({
      context,
      event,
    }: {
      context: IndexingEngineContext;
      event: EventWithArgs<{ node: Node; resolver: NormalizedAddress }>;
    }) => {
      // ignore the event on ENSv1RegistryOld if node is migrated to new Registry
      const shouldIgnoreEvent = await nodeIsMigrated(context, event.args.node);
      if (shouldIgnoreEvent) return;

      await handleNewResolver({ context, event });
    },
  );

  /**
   * Handles Registry#NewResolver for:
   * - ENS Root Chain's (new) Registry
   * - Basename's (shadow) Registry
   * - Lineanames's (shadow) Registry
   */
  adapter.on(
    namespaceContract(PluginName.ProtocolAcceleration, "ENSv1Registry:NewResolver"),
    handleNewResolver,
  );
}
