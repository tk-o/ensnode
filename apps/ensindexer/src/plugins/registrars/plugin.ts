/**
 * The `registrars` plugin indexes data about ENS subregistries, specifically the
 * registrar and registrar controller contracts that manage registrations and renewals
 * for known subregistry base registrars for the following:
 * - Ethnames
 * - Basenames
 * - Lineanames
 */

import * as ponder from "ponder";

import { DatasourceNames } from "@ensnode/datasources";
import { PluginName } from "@ensnode/ensnode-sdk";

import {
  createPlugin,
  getDatasourceAsFullyDefinedAtCompileTime,
  namespaceContract,
} from "@/lib/plugin-helpers";
import { chainConfigForContract, chainsConnectionConfig } from "@/lib/ponder-helpers";

const pluginName = PluginName.Registrars;

export default createPlugin({
  name: pluginName,
  requiredDatasourceNames: [
    DatasourceNames.ENSRoot,
    DatasourceNames.Basenames,
    DatasourceNames.Lineanames,
  ],
  createPonderConfig(config) {
    // configure Ethnames dependencies
    const ethnamesDatasource = getDatasourceAsFullyDefinedAtCompileTime(
      config.namespace,
      DatasourceNames.ENSRoot,
    );

    const ethnamesRegistrarContracts = {
      [namespaceContract(pluginName, "Eth_BaseRegistrarOld")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          ethnamesDatasource.chain.id,
          ethnamesDatasource.contracts.BaseRegistrarOld,
        ),
        abi: ethnamesDatasource.contracts.BaseRegistrarOld.abi,
      },

      [namespaceContract(pluginName, "Eth_BaseRegistrar")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          ethnamesDatasource.chain.id,
          ethnamesDatasource.contracts.BaseRegistrar,
        ),
        abi: ethnamesDatasource.contracts.BaseRegistrar.abi,
      },
    };

    const ethnamesRegistrarControllerContracts = {
      [namespaceContract(pluginName, "Eth_LegacyEthRegistrarController")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          ethnamesDatasource.chain.id,
          ethnamesDatasource.contracts.LegacyEthRegistrarController,
        ),
        abi: ethnamesDatasource.contracts.LegacyEthRegistrarController.abi,
      },
      [namespaceContract(pluginName, "Eth_WrappedEthRegistrarController")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          ethnamesDatasource.chain.id,
          ethnamesDatasource.contracts.WrappedEthRegistrarController,
        ),
        abi: ethnamesDatasource.contracts.WrappedEthRegistrarController.abi,
      },
      [namespaceContract(pluginName, "Eth_UnwrappedEthRegistrarController")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          ethnamesDatasource.chain.id,
          ethnamesDatasource.contracts.UnwrappedEthRegistrarController,
        ),
        abi: ethnamesDatasource.contracts.UnwrappedEthRegistrarController.abi,
      },
    };

    // configure Basenames dependencies
    const basenamesDatasource = getDatasourceAsFullyDefinedAtCompileTime(
      config.namespace,
      DatasourceNames.Basenames,
    );

    const basenamesRegistrarContracts = {
      [namespaceContract(pluginName, "BaseEth_BaseRegistrar")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          basenamesDatasource.chain.id,
          basenamesDatasource.contracts.BaseRegistrar,
        ),
        abi: basenamesDatasource.contracts.BaseRegistrar.abi,
      },
    };

    const basenamesRegistrarControllerContracts = {
      [namespaceContract(pluginName, "BaseEth_EARegistrarController")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          basenamesDatasource.chain.id,
          basenamesDatasource.contracts.EARegistrarController,
        ),
        abi: basenamesDatasource.contracts.EARegistrarController.abi,
      },
      [namespaceContract(pluginName, "BaseEth_RegistrarController")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          basenamesDatasource.chain.id,
          basenamesDatasource.contracts.RegistrarController,
        ),
        abi: basenamesDatasource.contracts.RegistrarController.abi,
      },
      [namespaceContract(pluginName, "BaseEth_UpgradeableRegistrarController")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          basenamesDatasource.chain.id,
          basenamesDatasource.contracts.UpgradeableRegistrarController,
        ),
        abi: basenamesDatasource.contracts.UpgradeableRegistrarController.abi,
      },
    };

    // configure Lineanames dependencies
    const linenamesDatasource = getDatasourceAsFullyDefinedAtCompileTime(
      config.namespace,
      DatasourceNames.Lineanames,
    );

    const lineanamesRegistrarContracts = {
      [namespaceContract(pluginName, "LineaEth_BaseRegistrar")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          linenamesDatasource.chain.id,
          linenamesDatasource.contracts.BaseRegistrar,
        ),
        abi: linenamesDatasource.contracts.BaseRegistrar.abi,
      },
    };

    const lineanamesRegistrarControllerContracts = {
      [namespaceContract(pluginName, "LineaEth_EthRegistrarController")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          linenamesDatasource.chain.id,
          linenamesDatasource.contracts.EthRegistrarController,
        ),
        abi: linenamesDatasource.contracts.EthRegistrarController.abi,
      },
    };

    return ponder.createConfig({
      chains: {
        ...chainsConnectionConfig(config.rpcConfigs, ethnamesDatasource.chain.id),
        ...chainsConnectionConfig(config.rpcConfigs, basenamesDatasource.chain.id),
        ...chainsConnectionConfig(config.rpcConfigs, linenamesDatasource.chain.id),
      },
      contracts: {
        ...ethnamesRegistrarContracts,
        ...ethnamesRegistrarControllerContracts,
        ...basenamesRegistrarContracts,
        ...basenamesRegistrarControllerContracts,
        ...lineanamesRegistrarContracts,
        ...lineanamesRegistrarControllerContracts,
      },
    });
  },
});
