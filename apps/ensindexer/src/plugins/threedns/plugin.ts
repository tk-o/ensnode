/**
 * The ThreeDNS plugin describes indexing behavior for 3DNSToken on both Optimism and Base.
 */
import { DatasourceNames } from "@ensnode/datasources";
import { PluginName } from "@ensnode/ensnode-sdk";
import { createConfig } from "ponder";

import type { ENSIndexerConfig } from "@/config/types";
import {
  type ENSIndexerPlugin,
  activateHandlers,
  getDatasourceAsFullyDefinedAtCompileTime,
  makePluginNamespace,
  networkConfigForContract,
  networksConfigForChain,
} from "@/lib/plugin-helpers";

const pluginName = PluginName.ThreeDNS;

// enlist datasources used within createPonderConfig function
// useful for config validation
const requiredDatasources = [DatasourceNames.ThreeDNSOptimism, DatasourceNames.ThreeDNSBase];

// construct a unique contract namespace for this plugin
const pluginNamespace = makePluginNamespace(pluginName);

// config object factory used to derive PluginConfig type
function createPonderConfig(config: ENSIndexerConfig) {
  const { chain: optimism, contracts: optimismContracts } =
    getDatasourceAsFullyDefinedAtCompileTime(config.namespace, DatasourceNames.ThreeDNSOptimism);

  const { chain: base, contracts: baseContracts } = getDatasourceAsFullyDefinedAtCompileTime(
    config.namespace,
    DatasourceNames.ThreeDNSBase,
  );

  return createConfig({
    networks: {
      ...networksConfigForChain(config, optimism.id),
      ...networksConfigForChain(config, base.id),
    },
    contracts: {
      [pluginNamespace("ThreeDNSToken")]: {
        network: {
          ...networkConfigForContract(config, optimism, optimismContracts.ThreeDNSToken),
          ...networkConfigForContract(config, base, baseContracts.ThreeDNSToken),
        },
        abi: optimismContracts.ThreeDNSToken.abi,
      },
      [pluginNamespace("Resolver")]: {
        network: {
          ...networkConfigForContract(config, optimism, optimismContracts.Resolver),
          ...networkConfigForContract(config, base, baseContracts.Resolver),
        },
        abi: optimismContracts.Resolver.abi,
      },
    },
  });
}

// Implicitly define the type returned by createPonderConfig
type PonderConfig = ReturnType<typeof createPonderConfig>;

export default {
  /**
   * Activate the plugin handlers for indexing.
   */
  activate: activateHandlers({
    pluginName,
    pluginNamespace: pluginNamespace,
    handlers: () => [import("./handlers/ThreeDNSToken")],
  }),

  /**
   * Create the ponder configuration lazily to prevent premature execution of
   * nested factory functions, i.e. to ensure that the ponder configuration
   * is only created for this plugin when it is activated.
   */
  createPonderConfig,

  /** The unique plugin name */
  pluginName,

  /** The plugin's required Datasources */
  requiredDatasources,
} as const satisfies ENSIndexerPlugin<PluginName.ThreeDNS, PonderConfig>;
