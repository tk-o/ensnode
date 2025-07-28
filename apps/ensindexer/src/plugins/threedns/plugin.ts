/**
 * The ThreeDNS plugin describes indexing behavior for 3DNSToken on both Optimism and Base.
 */

import {
  createPlugin,
  getDatasourceAsFullyDefinedAtCompileTime,
  namespaceContract,
} from "@/lib/plugin-helpers";
import { chainConfigForContract, chainsConnectionConfig } from "@/lib/ponder-helpers";
import { DatasourceNames, ResolverABI } from "@ensnode/datasources";
import { PluginName } from "@ensnode/ensnode-sdk";
import * as ponder from "ponder";

const pluginName = PluginName.ThreeDNS;

export default createPlugin({
  name: pluginName,
  requiredDatasourceNames: [DatasourceNames.ThreeDNSOptimism, DatasourceNames.ThreeDNSBase],
  createPonderConfig(config) {
    const threeDNSOptimism = getDatasourceAsFullyDefinedAtCompileTime(
      config.namespace,
      DatasourceNames.ThreeDNSOptimism,
    );
    const threeDNSBase = getDatasourceAsFullyDefinedAtCompileTime(
      config.namespace,
      DatasourceNames.ThreeDNSBase,
    );

    return ponder.createConfig({
      chains: {
        ...chainsConnectionConfig(config.rpcConfigs, threeDNSOptimism.chain.id),
        ...chainsConnectionConfig(config.rpcConfigs, threeDNSBase.chain.id),
      },
      contracts: {
        // multi-chain ThreeDNSToken indexing config
        [namespaceContract(pluginName, "ThreeDNSToken")]: {
          chain: {
            ...chainConfigForContract(
              config.globalBlockrange,
              threeDNSOptimism.chain.id,
              threeDNSOptimism.contracts.ThreeDNSToken,
            ),
            ...chainConfigForContract(
              config.globalBlockrange,
              threeDNSBase.chain.id,
              threeDNSBase.contracts.ThreeDNSToken,
            ),
          },
          // NOTE: abi is identical in a multi-chain ponder config, just use Optimism's here
          abi: threeDNSOptimism.contracts.ThreeDNSToken.abi,
        },
        // multi-chain ThreeDNS-specific Resolver indexing config
        [namespaceContract(pluginName, "Resolver")]: {
          abi: ResolverABI,
          chain: {
            ...chainConfigForContract(
              config.globalBlockrange,
              threeDNSOptimism.chain.id,
              threeDNSOptimism.contracts.Resolver,
            ),
            ...chainConfigForContract(
              config.globalBlockrange,
              threeDNSBase.chain.id,
              threeDNSBase.contracts.Resolver,
            ),
          },
        },
      },
    });
  },
});
