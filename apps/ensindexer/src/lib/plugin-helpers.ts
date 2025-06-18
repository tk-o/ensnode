import type { ENSIndexerConfig, RpcConfig } from "@/config/types";
import { networkConfigForContract, networksConfigForChain } from "@/lib/ponder-helpers";
import type { Blockrange } from "@/lib/types";
import {
  type ContractConfig,
  DatasourceName,
  type ENSDeploymentChain,
  getENSDeployment,
} from "@ensnode/ens-deployments";
import { type Label, type Name, PluginName } from "@ensnode/ensnode-sdk";
import type { createConfig as createPonderConfig } from "ponder";

/**
 * A factory function that returns a function to create a namespaced contract name for Ponder handlers.
 *
 * Ponder config requires a flat dictionary of contract config entires, where each entry has its
 * unique name and set of EVM event names derived from the contract's ABI. Ponder will use contract
 * names and their respective event names to create names for indexing handlers. For example, a contract
 * named  `Registry` includes events: `NewResolver` and `NewTTL`. Ponder will create indexing handlers
 * named `Registry:NewResolver` and `Registry:NewTTL`.
 *
 * However, because plugins within ENSIndexer may use the same contract/event names, an additional
 * namespace prefix is required to distinguish between contracts having the same name, with different
 * implementations. The strong typing is helpful and necessary for Ponder's auto-generated types to apply.
 *
 * @example
 * ```ts
 * const subgraphNamespace = makePluginNamespace(PluginName.Subgraph);
 * const basenamesNamespace = makePluginNamespace(PluginName.Basenames);
 *
 * subgraphNamespace("Registry"); // returns "subgraph/Registry"
 * basenamesNamespace("Registry"); // returns "basenames/Registry"
 * ```
 */
export function makePluginNamespace<const PLUGIN_NAME extends PluginName>(pluginName: PLUGIN_NAME) {
  if (/[.:]/.test(pluginName)) {
    throw new Error("Reserved character: Plugin namespace prefix cannot contain '.' or ':'");
  }

  /** Creates a namespaced contract name */
  return function pluginNamespace<const CONTRACT_NAME extends string>(
    contractName: CONTRACT_NAME,
  ): `${PLUGIN_NAME}/${CONTRACT_NAME}` {
    return `${pluginName}/${contractName}` as const;
  };
}

/**
 * Describes an ENSIndexerPlugin used within the ENSIndexer project.
 */
export interface ENSIndexerPlugin<
  PLUGIN_NAME extends PluginName,
  REQUIRED_DATASOURCES extends readonly DatasourceName[],
  CHAINS extends object,
  CONTRACTS extends object,
  ACCOUNTS extends object = {},
  BLOCKS extends object = {},
> {
  /**
   * A unique plugin name for identification
   */
  name: PLUGIN_NAME;

  /**
   * A list of DatasourceNames this plugin requires access to, necessary for determining whether
   * a set of ACTIVE_PLUGINS are valid for a given ENS_DEPLOYMENT_CHAIN
   */
  requiredDatasources: REQUIRED_DATASOURCES;

  /**
   * Get Ponder Config for the plugin.
   *
   * @param {ENSIndexerConfigSlice} ensIndexerConfig
   */
  getPonderConfig(
    ensIndexerConfig: ENSIndexerConfig,
  ): PonderConfigResult<CHAINS, CONTRACTS, ACCOUNTS, BLOCKS>;

  /**
   * Function to prefix a contract name with the plugin's namespace.
   *
   * It allows multiple plugins to provide configuration for the same contract name,
   * for example, `Registry`, and at the same time, enables creating separate event handlers
   * for each plugin.
   *
   * Examples:
   * - PluginName.Basenames
   *.   `(parameter) namespace: <"Registry">(contractName: "Registry") => "basenames/Registry"`
   * - PluginName.Lineanames
   *.   `(parameter) namespace: <"Registry">(contractName: "Registry") => "lineanames/Registry"`
   */
  namespace: MakePluginNamespaceResult<PLUGIN_NAME>;
}

/**
 * An ENSIndexerPlugin's handlers are provided runtime information about their respective plugin.
 */
export type ENSIndexerPluginHandlerArgs<PLUGIN_NAME extends PluginName = PluginName> = {
  name: PLUGIN_NAME;
  namespace: MakePluginNamespaceResult<PLUGIN_NAME>;
};

/**
 * An ENSIndexerPlugin accepts ENSIndexerPluginHandlerArgs and registers ponder event handlers.
 */
export type ENSIndexerPluginHandler<PLUGIN_NAME extends PluginName = PluginName> = (
  args: ENSIndexerPluginHandlerArgs<PLUGIN_NAME>,
) => void;

/**
 * Result type for {@link getDatasourceConfigOptions}
 */
interface DatasourceConfigOptions<DATASOURCE_NAME extends DatasourceName> {
  /**
   * Contracts configuration for the datasource (comes from `requiredDatasources`)
   */
  contracts: ContractsForDatasource<DATASOURCE_NAME>;

  /**
   * Networks configuration for the datasource
   */
  networks: ReturnType<typeof networksConfigForChain>;

  /**
   * Contract-specific network configuration for the datasource
   *
   * @param contractConfig
   * @returns
   */
  getContractNetwork: <CONTRACT_CONFIG extends ContractConfig>(
    contractConfig: CONTRACT_CONFIG,
  ) => ReturnType<typeof networkConfigForContract>;
}

/**
 * Options for `buildPonderConfig` callback on {@link BuildPluginOptions} type.
 */
export interface PluginConfigOptions<
  PLUGIN_NAME extends PluginName,
  DATASOURCE_NAME extends DatasourceName,
> {
  datasourceConfigOptions(
    datasourceName: DATASOURCE_NAME,
  ): DatasourceConfigOptions<DATASOURCE_NAME>;
  namespace: MakePluginNamespaceResult<PLUGIN_NAME>;
}

/**
 * Options type for `buildPlugin` function input.
 */
export interface BuildPluginOptions<
  PLUGIN_NAME extends PluginName,
  REQUIRED_DATASOURCES extends readonly DatasourceName[],
  // This generic will capture the exact PonderConfigResult, including the inferred types.
  PONDER_CONFIG extends PonderConfigResult,
> {
  /** The unique plugin name */
  name: PLUGIN_NAME;

  /** The plugin's required Datasources */
  requiredDatasources: REQUIRED_DATASOURCES;

  /**
   * Build the ponder configuration lazily to prevent premature execution of
   * nested factory functions, i.e. to ensure that the ponder configuration
   * is only created for this plugin when it is activated.
   */
  buildPonderConfig(
    options: PluginConfigOptions<PLUGIN_NAME, REQUIRED_DATASOURCES[number]>,
  ): PONDER_CONFIG;
}

/**
 * Helper type to capture the return type of `createPonderConfig` with its `const` inferred generics.
 * This is the exact shape of a Ponder config.
 */
type PonderConfigResult<
  CHAINS extends object = {},
  CONTRACTS extends object = {},
  ACCOUNTS extends object = {},
  BLOCKS extends object = {},
> = ReturnType<typeof createPonderConfig<CHAINS, CONTRACTS, ACCOUNTS, BLOCKS>>;

/**
 * Helper type to capture specific datasource type from a given ENSDeployment.
 */
type DeploymentForDatasource<DATASOURCE_NAME extends DatasourceName> = ReturnType<
  typeof getENSDeployment
>[DATASOURCE_NAME];

/**
 * Helper type to capture specific contracts type from a given Datasource.
 */
type ContractsForDatasource<DATASOURCE_NAME extends DatasourceName> =
  DeploymentForDatasource<DATASOURCE_NAME>["contracts"];

/**
 * Helper type to capture a contract namespace factory type for a given plugin name.
 */
type MakePluginNamespaceResult<PLUGIN_NAME extends PluginName> = ReturnType<
  typeof makePluginNamespace<PLUGIN_NAME>
>;

const POSSIBLE_PREFIXES = [
  "data:application/json;base64,",
  "data:application/json;_base64,", // idk, sometimes 3dns returns this malformed prefix
];

/**
 * Parses a base64-encoded JSON metadata URI to extract the label and name.
 *
 * @param uri - The base64-encoded JSON metadata URI string
 * @returns A tuple containing [label, name] if parsing succeeds, or [null, null] if it fails
 */
export function parseLabelAndNameFromOnChainMetadata(uri: string): [Label, Name] | [null, null] {
  if (!POSSIBLE_PREFIXES.some((prefix) => uri.startsWith(prefix))) {
    // console.error("Invalid tokenURI format:", uri);
    return [null, null];
  }

  const base64String = POSSIBLE_PREFIXES.reduce((memo, prefix) => memo.replace(prefix, ""), uri);
  const jsonString = Buffer.from(base64String, "base64").toString("utf-8");
  const metadata = JSON.parse(jsonString);

  // trim the . off the end of the fqdn
  const name = metadata?.name?.slice(0, -1);
  if (!name) return [null, null];

  const [label] = name.split(".");

  return [label, name];
}

/**
 * Get Datasource Config Options for a given datasource name.
 * Used as data provider to `buildPonderConfig` function,
 * where Ponder Configuration object is built for a specific plugin.
 *
 * @param ensDeploymentChain
 * @param globalBlockrange
 * @param rpcConfigs
 * @param datasourceName
 * @returns
 */
export function getDatasourceConfigOptions<const DATASOURCE_NAME extends DatasourceName>(
  ensDeploymentChain: ENSDeploymentChain,
  globalBlockrange: Blockrange,
  rpcConfigs: Record<number, RpcConfig>,
  datasourceName: DATASOURCE_NAME,
): DatasourceConfigOptions<DATASOURCE_NAME> {
  // First, get the datasource object for a given `ensDeploymentChain` and `datasourceName`.
  const deployment = getENSDeployment(ensDeploymentChain);
  const datasource = deployment[datasourceName] as DeploymentForDatasource<DATASOURCE_NAME>;
  const chainId = datasource.chain.id;

  // Then, get contracts configuration from the selected datasource object.
  const contracts = datasource.contracts as ContractsForDatasource<DATASOURCE_NAME>;

  /**
   * Networks configuration based on rpcConfigs and datasource chain ID.
   * Used for building the plugin's ponder config object.
   */
  const networks = networksConfigForChain(chainId, rpcConfigs);

  // Create a getter function that allows accessing network configuration for a given `contractConfig`
  // Get network configuration based on contract config, global blockrange, and datasource chain configuration.
  // Used for building the plugin's ponder config object.
  const getContractNetwork = <CONTRACT_CONFIG extends ContractConfig>(
    contractConfig: CONTRACT_CONFIG,
  ) => networkConfigForContract(chainId, globalBlockrange, contractConfig);

  return {
    contracts,
    networks,
    getContractNetwork,
  } as const;
}

/**
 * Build Plugin for ENSIndexer.
 *
 * This factory function allows building a plugin object in a confident way,
 * leveraging type system to build Ponder configuration for the plugin and
 * use it when defining the global Ponder configuration object from
 * all active plugins.
 */
export function buildPlugin<
  PLUGIN_NAME extends PluginName,
  REQUIRED_DATASOURCES extends readonly DatasourceName[],
  PONDER_CONFIG extends PonderConfigResult,
>(
  options: BuildPluginOptions<PLUGIN_NAME, REQUIRED_DATASOURCES, PONDER_CONFIG>,
): ENSIndexerPlugin<
  PLUGIN_NAME,
  REQUIRED_DATASOURCES,
  PONDER_CONFIG["networks"],
  PONDER_CONFIG["contracts"],
  PONDER_CONFIG["accounts"],
  PONDER_CONFIG["blocks"]
> {
  const namespace = makePluginNamespace(options.name);

  const getPonderConfig = (config: ENSIndexerConfig): PONDER_CONFIG => {
    const { ensDeploymentChain, globalBlockrange, rpcConfigs } = config;

    return options.buildPonderConfig({
      datasourceConfigOptions<DATASOURCE_NAME extends REQUIRED_DATASOURCES[number]>(
        datasourceName: DATASOURCE_NAME,
      ) {
        return getDatasourceConfigOptions(
          ensDeploymentChain,
          globalBlockrange,
          rpcConfigs,
          datasourceName,
        );
      },
      namespace,
    });
  };

  return {
    getPonderConfig,
    name: options.name,
    requiredDatasources: options.requiredDatasources,
    namespace,
  } as const satisfies ENSIndexerPlugin<
    PLUGIN_NAME,
    REQUIRED_DATASOURCES,
    PONDER_CONFIG["networks"],
    PONDER_CONFIG["contracts"],
    PONDER_CONFIG["accounts"],
    PONDER_CONFIG["blocks"]
  >;
}
