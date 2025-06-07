import type { ENSIndexerConfig } from "@/config/types";
import { uniq } from "@/lib/lib-helpers";
import type { Blockrange } from "@/lib/types";
import { getRequiredDatasourceNames } from "@/plugins";
import {
  ContractConfig,
  Datasource,
  DatasourceName,
  getENSDeployment,
} from "@ensnode/ens-deployments";
import { Label, Name, PluginName } from "@ensnode/ensnode-sdk";
import type { NetworkConfig, createConfig as createPonderConfig } from "ponder";
import { http, Chain } from "viem";

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
   * An ENSIndexerPlugin must return a Ponder Config.
   * https://ponder.sh/docs/contracts-and-networks
   */
  getPonderConfig(
    ensIndexerConfig: ENSIndexerConfigSlice,
  ): CreatePonderConfigReturnType<CHAINS, CONTRACTS, ACCOUNTS, BLOCKS>;

  /**
   * An `activate` handler that should load the plugin's handlers that eventually execute `ponder.on`
   */
  activate: () => Promise<void>;
}

/**
 * An ENSIndexerPlugin's handlers are provided runtime information about their respective plugin.
 */
export type ENSIndexerPluginHandlerArgs<PLUGIN_NAME extends PluginName = PluginName> = {
  pluginName: PluginName;
  namespace: ReturnType<typeof makePluginNamespace<PLUGIN_NAME>>;
};

/**
 * An ENSIndexerPlugin accepts ENSIndexerPluginHandlerArgs and registers ponder event handlers.
 */
export type ENSIndexerPluginHandler<PLUGIN_NAME extends PluginName> = (
  args: ENSIndexerPluginHandlerArgs<PLUGIN_NAME>,
) => void;

/**
 * A helper function for defining an ENSIndexerPlugin's `activate()` function.
 *
 * Given a set of handler file imports, returns a function that executes them with the provided args.
 */
export const activateHandlers =
  <PLUGIN_NAME extends PluginName>({
    handlers,
    ...args
  }: ENSIndexerPluginHandlerArgs<PLUGIN_NAME> & {
    handlers: () => Promise<{ default: ENSIndexerPluginHandler<PLUGIN_NAME> }>[];
  }) =>
  async () => {
    await Promise.all(handlers()).then((modules) => modules.map((m) => m.default(args)));
  };

/**
 * Get a list of unique datasources for selected plugin names.
 * @param pluginNames
 * @returns
 */
export function getDatasources(
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
export function getIndexedChainIds(datasources: Datasource[]): number[] {
  const indexedChainIds = datasources.map((datasource) => datasource.chain.id);

  return uniq(indexedChainIds);
}

/**
 * Builds a ponder#NetworksConfig for a single, specific chain.
 */
export function networksConfigForChain(
  config: Pick<ENSIndexerConfig, "rpcConfigs">,
  chainId: number,
) {
  if (!config.rpcConfigs[chainId]) {
    throw new Error(
      `networksConfigForChain called for chain id ${chainId} but no associated rpcConfig is available in ENSIndexerConfig. rpcConfig specifies the following chain ids: [${Object.keys(config.rpcConfigs).join(", ")}].`,
    );
  }

  const { url, maxRequestsPerSecond } = config.rpcConfigs[chainId]!;

  return {
    [chainId.toString()]: {
      chainId: chainId,
      transport: http(url),
      maxRequestsPerSecond,
      // NOTE: disable cache on local chains (e.g. Anvil, Ganache)
      ...((chainId === 31337 || chainId === 1337) && { disableCache: true }),
    } satisfies NetworkConfig,
  };
}

/**
 * Builds a `ponder#ContractConfig['network']` given a contract's config, constraining the contract's
 * indexing range by the globally configured blockrange.
 */
export function networkConfigForContract<CONTRACT_CONFIG extends ContractConfig>(
  config: Pick<ENSIndexerConfig, "globalBlockrange">,
  chain: Chain,
  contractConfig: CONTRACT_CONFIG,
) {
  return {
    [chain.id.toString()]: {
      address: contractConfig.address, // provide per-network address if available
      ...constrainContractBlockrange(config, contractConfig.startBlock), // per-network blockrange
    },
  };
}

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
 * Given a contract's start block, returns a block range describing a start and end block
 * that maintains validity within the global blockrange. The returned start block will always be
 * defined, but if no end block is specified, the returned end block will be undefined, indicating
 * that ponder should index the contract in perpetuity.
 *
 * @param config the configuration object including `globalBlockrange` value
 * @param contractStartBlock the preferred start block for the given contract, defaulting to 0
 * @returns the start and end blocks, contrained to the provided `start` and `end`
 *  i.e. (startBlock || 0) <= (contractStartBlock || 0) <= (endBlock if specificed)
 */
export const constrainContractBlockrange = (
  config: Pick<ENSIndexerConfig, "globalBlockrange">,
  contractStartBlock: number | undefined = 0,
): Blockrange => {
  const { startBlock, endBlock } = config.globalBlockrange;

  const isEndConstrained = endBlock !== undefined;
  const concreteStartBlock = Math.max(startBlock || 0, contractStartBlock);

  return {
    startBlock: isEndConstrained ? Math.min(concreteStartBlock, endBlock) : concreteStartBlock,
    endBlock,
  };
};

// Helper type for getting right datasource mapped for requested datasource name
type DeploymentForDatasource<T extends DatasourceName> = ReturnType<typeof getENSDeployment>[T];

// Ensure proper typing for contracts based on datasource
type ContractsForDatasource<T extends DatasourceName> = DeploymentForDatasource<T>["contracts"];

// Ensure proper typing for chain based on datasource
type ChainForDatasource<T extends DatasourceName> = DeploymentForDatasource<T>["chain"];

// Describes the dependency of an ENSIndexerPlugin on ENSIndexerConfig
export type ENSIndexerConfigSlice = Pick<
  ENSIndexerConfig,
  "ensDeploymentChain" | "globalBlockrange" | "rpcConfigs"
>;

/**
 * Options for `pluginConfig` callback on `DefinePluginOptions` type.
 */
export interface PluginConfigOptions<
  PLUGIN_NAME extends PluginName,
  DATASOURCE_NAME extends DatasourceName,
> {
  /**
   * Get datasource configuration for requested datasource name.
   * @param {DatasourceName} datasourceName
   * @returns {DatasourceConfigOptions} datasource configuration options
   */
  datasourceConfigOptions(datasourceName: DATASOURCE_NAME): {
    deployment: ReturnType<typeof getENSDeployment>;
    datasource: DeploymentForDatasource<DATASOURCE_NAME>;
    chain: ChainForDatasource<DATASOURCE_NAME>;
    contracts: ContractsForDatasource<DATASOURCE_NAME>;
    networksConfigForChain: () => ReturnType<typeof networksConfigForChain>;
    networkConfigForContract: <CONTRACT_CONFIG extends ContractConfig>(
      contractConfig: CONTRACT_CONFIG,
    ) => ReturnType<typeof networkConfigForContract>;
    config: Pick<ENSIndexerConfigSlice, "ensDeploymentChain" | "globalBlockrange" | "rpcConfigs">;
    datasourceName: DATASOURCE_NAME;
  };

  namespace: ReturnType<typeof makePluginNamespace<PLUGIN_NAME>>;
}

type CreatePonderConfigReturnType<Chains, Contracts, Accounts, Blocks> = ReturnType<
  typeof createPonderConfig<Chains, Contracts, Accounts, Blocks>
>;

interface DefinePluginOptions<
  PLUGIN_NAME extends PluginName,
  REQUIRED_DATASOURCES extends readonly DatasourceName[],
  // New generic parameters for the Ponder config parts
  CHAINS extends object, // Represents the 'chains' type for Ponder config
  CONTRACTS extends object, // Represents the 'contracts' type for Ponder config
  ACCOUNTS extends object = {}, // Default to empty object if not used
  BLOCKS extends object = {}, // Default to empty object if not used
> {
  name: PLUGIN_NAME;
  requiredDatasources: REQUIRED_DATASOURCES;

  /**
   * Build ponder config with plugin-specific options.
   *
   * @param options
   */
  buildPonderConfig(
    options: PluginConfigOptions<PLUGIN_NAME, REQUIRED_DATASOURCES[number]>,
  ): CreatePonderConfigReturnType<CHAINS, CONTRACTS, ACCOUNTS, BLOCKS>;

  indexingHandlers(): Promise<{ default: ENSIndexerPluginHandler<PLUGIN_NAME> }>[];
}

/**
 * Define a plugin for ENSIndexer
 * @param {DefinePluginOptions} options
 * @returns ENSIndexerPlugin object
 */
export function definePlugin<
  PLUGIN_NAME extends PluginName,
  REQUIRED_DATASOURCES extends readonly DatasourceName[],
  CHAINS extends object,
  CONTRACTS extends object,
  ACCOUNTS extends object = {},
  BLOCKS extends object = {},
>(
  options: DefinePluginOptions<
    PLUGIN_NAME,
    REQUIRED_DATASOURCES,
    CHAINS,
    CONTRACTS,
    ACCOUNTS,
    BLOCKS
  >,
): ENSIndexerPlugin<PLUGIN_NAME, REQUIRED_DATASOURCES, CHAINS, CONTRACTS, ACCOUNTS, BLOCKS> {
  // construct a unique contract namespace for this plugin
  const namespace = makePluginNamespace(options.name);

  // plugin config factory function
  const getPonderConfig = (
    config: ENSIndexerConfigSlice,
  ): CreatePonderConfigReturnType<CHAINS, CONTRACTS, ACCOUNTS, BLOCKS> => {
    return options.buildPonderConfig({
      datasourceConfigOptions<T extends REQUIRED_DATASOURCES[number]>(datasourceName: T) {
        return getDatasourceConfigOptions(config, datasourceName);
      },
      namespace,
    });
  };

  /**
   * A helper function for defining an ENSIndexerPlugin's `activate()` function.
   *
   * Given a set of handler file imports, returns a function that executes them with the provided args.
   */
  const activateHandlers = async () => {
    const args = {
      namespace,
      pluginName: options.name,
    } satisfies ENSIndexerPluginHandlerArgs<PLUGIN_NAME>;

    await Promise.all(options.indexingHandlers()).then((modules) =>
      modules.map((m) => m.default(args)),
    );
  };

  return {
    /**
     * Activate the plugin handlers for indexing.
     */
    async activate(): Promise<void> {
      return activateHandlers();
    },

    /**
     * Load the plugin configuration lazily to prevent premature execution of
     * nested factory functions, i.e. to ensure that the plugin configuration
     * is only built when the plugin is activated.
     */
    getPonderConfig,

    /**
     * The plugin name, used for identification.
     */
    name: options.name,

    /**
     * The plugin required datasources, used for validation.
     */
    requiredDatasources: options.requiredDatasources,
  } as const satisfies ENSIndexerPlugin<
    PLUGIN_NAME,
    REQUIRED_DATASOURCES,
    CHAINS,
    CONTRACTS,
    ACCOUNTS,
    BLOCKS
  >;
}

export type DatasourceConfigOptions<DATASOURCE_NAME extends DatasourceName> = ReturnType<
  typeof getDatasourceConfigOptions<DATASOURCE_NAME>
> &
  Datasource;

/**
 * Factory function creating required values for a given datasource and ENSIndexer config.
 * It's necessary for defining a plugin.
 *
 * @param config
 * @param datasourceName
 * @returns
 */
export function getDatasourceConfigOptions<const DATASOURCE_NAME extends DatasourceName>(
  config: Pick<ENSIndexerConfigSlice, "ensDeploymentChain" | "globalBlockrange" | "rpcConfigs">,
  datasourceName: DATASOURCE_NAME,
) {
  const deployment = getENSDeployment(config.ensDeploymentChain);
  const datasource = deployment[datasourceName] as DeploymentForDatasource<DATASOURCE_NAME>;

  // Create properly typed helper functions that preserve the generic constraint
  const networksConfigForChainTyped = () => {
    return networksConfigForChain(config, datasource.chain.id);
  };

  const networkConfigForContractTyped = <CONTRACT_CONFIG extends ContractConfig>(
    contractConfig: CONTRACT_CONFIG,
  ) => {
    return networkConfigForContract(config, datasource.chain, contractConfig);
  };

  return {
    deployment,
    datasource,
    chain: datasource.chain as ChainForDatasource<DATASOURCE_NAME>,
    // contract configuration for the datasource - properly typed based on datasource
    contracts: datasource.contracts as ContractsForDatasource<DATASOURCE_NAME>,

    // networks configuration for the datasource
    networksConfigForChain: networksConfigForChainTyped,

    // get network configuration for the given contract
    networkConfigForContract: networkConfigForContractTyped,
    config,
    datasourceName,
  } as const;
}
