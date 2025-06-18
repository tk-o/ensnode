/**
 * The Lineanames plugin describes indexing behavior for the Lineanames ENS Datasource, leveraging
 * the shared Subgraph-compatible indexing logic.
 */

import { buildPlugin } from "@/lib/plugin-helpers";
import { DatasourceName } from "@ensnode/ens-deployments";
import { PluginName } from "@ensnode/ensnode-sdk";
import { createConfig as createPonderConfig } from "ponder";

export default buildPlugin({
  name: PluginName.Lineanames,
  requiredDatasources: [DatasourceName.Lineanames],
  buildPonderConfig({ datasourceConfigOptions, namespace }) {
    const { contracts, networks, getContractNetwork } = datasourceConfigOptions(
      DatasourceName.Lineanames,
    );

    return createPonderConfig({
      networks,
      contracts: {
        [namespace("Registry")]: {
          network: getContractNetwork(contracts.Registry),
          abi: contracts.Registry.abi,
        },
        [namespace("BaseRegistrar")]: {
          network: getContractNetwork(contracts.BaseRegistrar),
          abi: contracts.BaseRegistrar.abi,
        },
        [namespace("EthRegistrarController")]: {
          network: getContractNetwork(contracts.EthRegistrarController),
          abi: contracts.EthRegistrarController.abi,
        },
        [namespace("NameWrapper")]: {
          network: getContractNetwork(contracts.NameWrapper),
          abi: contracts.NameWrapper.abi,
        },
        Resolver: {
          network: getContractNetwork(contracts.Resolver),
          abi: contracts.Resolver.abi,
        },
      },
    });
  },
});
