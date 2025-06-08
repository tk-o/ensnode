import { uniq } from "@/lib/lib-helpers";
import type { ENSIndexerPluginHandler } from "@/lib/plugin-helpers";
import { DatasourceName } from "@ensnode/ens-deployments";
import { PluginName } from "@ensnode/ensnode-sdk";
import basenamesPlugin from "./basenames/basenames.plugin";
import lineaNamesPlugin from "./lineanames/lineanames.plugin";
import subgraphPlugin from "./subgraph/subgraph.plugin";
import threednsPlugin from "./threedns/threedns.plugin";

export const ALL_PLUGINS = [
  subgraphPlugin,
  basenamesPlugin,
  lineaNamesPlugin,
  threednsPlugin,
] as const;

type AllPluginsUnionType = (typeof ALL_PLUGINS)[number];

export type AllPluginsConfig = MergedTypes<ReturnType<AllPluginsUnionType["getPonderConfig"]>>;

// Helper type to merge multiple types into one
type MergedTypes<T> = (T extends any ? (x: T) => void : never) extends (x: infer R) => void
  ? R
  : never;

/**
 * Get plugin object by plugin name.
 *
 * @see {ALL_PLUGINS} list
 */
export function getPlugin(pluginName: PluginName) {
  const plugin = ALL_PLUGINS.find((plugin) => plugin.name === pluginName);

  if (plugin) {
    return plugin;
  }

  // invariant: all plugins can be found by PluginName
  throw new Error(`Plugin not found by "${pluginName} name"`);
}

/**
 * Get a list of unique required datasource names from selected plugins.
 * @param pluginNames A list of selected plugin names.
 * @returns A list of unique datasource names.
 */
export function getRequiredDatasourceNames(pluginNames: PluginName[]): DatasourceName[] {
  const plugins = pluginNames.map((pluginName) => getPlugin(pluginName));
  const requiredDatasourceNames = plugins.flatMap((plugin) => plugin.requiredDatasources);

  return uniq(requiredDatasourceNames);
}

/**
 * Activate all indexing handlers for a plugin.
 *
 * @param plugin The ENSIndexerPlugin object for which indexing handlers must be activated.
 */
export async function activatePluginHandlers<const PLUGIN extends AllPluginsUnionType>(
  plugin: PLUGIN,
): Promise<void> {
  const pluginIndexingHandlers = await import(`./${plugin.name}/${plugin.name}.handlers.ts`).then(
    (mod) => mod.default as ENSIndexerPluginHandler[],
  );

  for (const pluginIndexingHandler of pluginIndexingHandlers) {
    pluginIndexingHandler(plugin);
  }
}
