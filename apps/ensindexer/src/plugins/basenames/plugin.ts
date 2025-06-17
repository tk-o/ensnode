/**
 * The Basenames plugin describes indexing behavior for the Basenames ENS Datasource, leveraging
 * the shared Subgraph-compatible indexing logic.
 */

import { buildPlugin } from "@/lib/plugin-helpers";
import { DatasourceName } from "@ensnode/ens-deployments";
import { PluginName } from "@ensnode/ensnode-sdk";
import { createConfig as createPonderConfig } from "ponder";

export default buildPlugin({
  name: PluginName.Basenames,
  requiredDatasources: [DatasourceName.Basenames],
  buildPonderConfig({ datasourceConfigOptions, namespace }) {
    const { contracts, networks, getContractNetwork } = datasourceConfigOptions(
      DatasourceName.Basenames,
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
        [namespace("EARegistrarController")]: {
          network: getContractNetwork(contracts.EARegistrarController),
          abi: contracts.EARegistrarController.abi,
        },
        [namespace("RegistrarController")]: {
          network: getContractNetwork(contracts.RegistrarController),
          abi: contracts.RegistrarController.abi,
        },
        Resolver: {
          network: getContractNetwork(contracts.Resolver),
          abi: contracts.Resolver.abi,
        },
      },
    });
  },
});
