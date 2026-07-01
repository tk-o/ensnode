import { PluginName } from "@ensnode/ensnode-sdk";

/**
 * Determines whether a plugin supports 'preminted' names. See `apps/ensindexer/src/handlers/Registrar.ts`
 * for further discussion.
 */
export const pluginSupportsPremintedNames = (pluginName: PluginName) =>
  [PluginName.Basenames, PluginName.Lineanames].includes(pluginName);

/**
 * Creates a namespaced contract name for indexing handlers.
 *
 * Indexing engines receive a flat dictionary of contracts, where each entry has a
 * unique name and set of EVM event names derived from the contract's ABI. Because
 * plugins may use the same contract/event names, an additional namespace prefix is
 * required to distinguish between contracts having the same name with different
 * implementations.
 *
 * @example
 * namespaceContract(PluginName.Subgraph, "Registry"); // "subgraph/Registry"
 * namespaceContract(PluginName.Basenames, "Registry"); // "basenames/Registry"
 */
export function namespaceContract<const PREFIX extends string, const CONTRACT_NAME extends string>(
  prefix: PREFIX,
  contractName: CONTRACT_NAME,
): `${PREFIX}/${CONTRACT_NAME}` {
  if (/[.:]/.test(prefix)) {
    throw new Error("Reserved character: Contract namespace prefix cannot contain '.' or ':'");
  }

  return `${prefix}/${contractName}` as const;
}
