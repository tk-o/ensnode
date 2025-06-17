import type { ENSIndexerConfig } from "@/config/types";
import { uniq } from "@/lib/lib-helpers";
import type { ENSIndexerPluginHandler } from "@/lib/plugin-helpers";
import { type Datasource, DatasourceName, getENSDeployment } from "@ensnode/ens-deployments";
import { PluginName } from "@ensnode/ensnode-sdk";
import basenamesPlugin from "./basenames/plugin";
import lineaNamesPlugin from "./lineanames/plugin";
import subgraphPlugin from "./subgraph/plugin";
import threednsPlugin from "./threedns/plugin";

export const ALL_PLUGINS = [
  subgraphPlugin,
  basenamesPlugin,
  lineaNamesPlugin,
  threednsPlugin,
] as const;

type AllPluginsUnionType = (typeof ALL_PLUGINS)[number];

// Helper type to let enable correct typing for the default-exported value from ponder.config.ts.
// It helps to keep TypeScript types working well for all plugins (regardless if active or not).
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
 * Get a list of unique datasources for selected plugin names.
 * @param pluginNames
 * @returns
 */
export function getRequiredDatasources(
  config: Pick<ENSIndexerConfig, "ensDeploymentChain" | "plugins">,
): Datasource[] {
  const requiredDatasourceNames = getRequiredDatasourceNames(config.plugins);
  const ensDeployment = getENSDeployment(config.ensDeploymentChain);
  const ensDeploymentDatasources = Object.entries(ensDeployment) as Array<
    [DatasourceName, Datasource]
  >;
  const datasources = {} as Record<DatasourceName, Datasource>;

  for (let [datasourceName, datasource] of ensDeploymentDatasources) {
    if (requiredDatasourceNames.includes(datasourceName)) {
      datasources[datasourceName] = datasource;
    }
  }

  return Object.values(datasources);
}

/**
 * Get a list of unique indexed chain IDs for selected plugin names.
 */
export function getRequiredChainIds(datasources: Datasource[]): number[] {
  const indexedChainIds = datasources.map((datasource) => datasource.chain.id);

  return uniq(indexedChainIds);
}

/**
 * Attach all event handlers for a plugin.
 *
 * @param plugin The ENSIndexerPlugin whose event handlers should be activated.
 */
export async function attachPluginEventHandlers<const PLUGIN extends AllPluginsUnionType>(
  plugin: PLUGIN,
): Promise<void> {
  // All plugins must have their own `event-handlers.ts` file.
  // We need to load this file lazily for each plugin than needs to be activated.
  // Lazy-loading is required to keep TypeScript type inference working well.
  // If we loaded the event-handlers.ts file for any plugin using
  // the eager-loading approach (such as regular import on the top of the file),
  // we'd cause circular inference error in TypeScript, as any event-handlers.ts file
  // needs to know the `ponder` object type, which includes the `AllPluginsConfig` type.
  // The `AllPluginsConfig` type is defined in this very file, and it must stay this way.
  const pluginEventHandlers = await import(`./${plugin.name}/event-handlers.ts`).then(
    // Use `export default` value as an array of ENSIndexerPluginHandler functions
    // defined for a plugin.
    (mod) => mod.default as ENSIndexerPluginHandler[],
  );

  // Attach all event handlers for the active ENSIndexer plugin
  for (const attachEventHandlers of pluginEventHandlers) {
    attachEventHandlers(plugin);
  }
}
