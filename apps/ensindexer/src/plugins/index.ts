import type { PluginName } from "@ensnode/ensnode-sdk";

import type { MergedTypes } from "@/lib/lib-helpers";

// Core-Schema-Indepdendent Plugins
import protocolAccelerationPlugin from "./protocol-acceleration/plugin";
import registrarsPlugin from "./registrars/plugin";
// Subgraph-Schema Core Plugins
import basenamesPlugin from "./subgraph/plugins/basenames/plugin";
import lineaNamesPlugin from "./subgraph/plugins/lineanames/plugin";
import subgraphPlugin from "./subgraph/plugins/subgraph/plugin";
import threednsPlugin from "./subgraph/plugins/threedns/plugin";
import tokenScopePlugin from "./tokenscope/plugin";

export const ALL_PLUGINS = [
  subgraphPlugin,
  basenamesPlugin,
  lineaNamesPlugin,
  threednsPlugin,
  tokenScopePlugin,
  protocolAccelerationPlugin,
  registrarsPlugin,
] as const;

/**
 * Helper type representing the merged Ponder config of all possible ENSIndexerPlugins. This
 * ensures that the inferred types of each Ponder config are available at compile-time to Ponder,
 * which uses it to power type inference in event handlers.
 */
export type AllPluginsMergedConfig = MergedTypes<
  ReturnType<(typeof ALL_PLUGINS)[number]["createPonderConfig"]>
>;

/**
 * Get plugin object by plugin name.
 *
 * @see {ALL_PLUGINS} list
 */
export function getPlugin(pluginName: PluginName) {
  const plugin = ALL_PLUGINS.find((plugin) => plugin.name === pluginName);

  if (!plugin) {
    // invariant: all plugins can be found by PluginName
    throw new Error(`Plugin not found by "${pluginName}" name.`);
  }

  return plugin;
}
