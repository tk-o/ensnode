/**
 * The `registrars` plugin indexes data about ENS subregistries, specifically the
 * registrar and registrar controller contracts that manage registrations and renewals
 * for known subregistry base registrars for the following:
 * - ENS Root (direct subnames of .eth)
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
    // configure ENSRoot dependencies
    const ensRootDatasource = getDatasourceAsFullyDefinedAtCompileTime(
      config.namespace,
      DatasourceNames.ENSRoot,
    );

    const ensRootRegistrarContracts = {
      [namespaceContract(pluginName, "Eth_BaseRegistrarOld")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          ensRootDatasource.chain.id,
          ensRootDatasource.contracts.BaseRegistrarOld,
        ),
        abi: ensRootDatasource.contracts.BaseRegistrarOld.abi,
      },

      [namespaceContract(pluginName, "Eth_BaseRegistrar")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          ensRootDatasource.chain.id,
          ensRootDatasource.contracts.BaseRegistrar,
        ),
        abi: ensRootDatasource.contracts.BaseRegistrar.abi,
      },
    };

    const ensRootRegistrarControllerContracts = {
      [namespaceContract(pluginName, "Eth_LegacyEthRegistrarController")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          ensRootDatasource.chain.id,
          ensRootDatasource.contracts.LegacyEthRegistrarController,
        ),
        abi: ensRootDatasource.contracts.LegacyEthRegistrarController.abi,
      },
      [namespaceContract(pluginName, "Eth_WrappedEthRegistrarController")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          ensRootDatasource.chain.id,
          ensRootDatasource.contracts.WrappedEthRegistrarController,
        ),
        abi: ensRootDatasource.contracts.WrappedEthRegistrarController.abi,
      },
      [namespaceContract(pluginName, "Eth_UnwrappedEthRegistrarController")]: {
        chain: chainConfigForContract(
          config.globalBlockrange,
          ensRootDatasource.chain.id,
          ensRootDatasource.contracts.UnwrappedEthRegistrarController,
        ),
        abi: ensRootDatasource.contracts.UnwrappedEthRegistrarController.abi,
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
        ...chainsConnectionConfig(config.rpcConfigs, ensRootDatasource.chain.id),
        ...chainsConnectionConfig(config.rpcConfigs, basenamesDatasource.chain.id),
        ...chainsConnectionConfig(config.rpcConfigs, linenamesDatasource.chain.id),
      },
      contracts: {
        ...ensRootRegistrarContracts,
        ...ensRootRegistrarControllerContracts,
        ...basenamesRegistrarContracts,
        ...basenamesRegistrarControllerContracts,
        ...lineanamesRegistrarContracts,
        ...lineanamesRegistrarControllerContracts,
      },
    });
  },
});
