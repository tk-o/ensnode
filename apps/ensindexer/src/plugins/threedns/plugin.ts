/**
 * The ThreeDNS plugin describes indexing behavior for 3DNSToken on both Optimism and Base.
 */

import { buildPlugin } from "@/lib/plugin-helpers";
import { DatasourceName } from "@ensnode/ens-deployments";
import { PluginName } from "@ensnode/ensnode-sdk";
import { createConfig as createPonderConfig } from "ponder";

export default buildPlugin({
  name: PluginName.ThreeDNS,
  requiredDatasources: [DatasourceName.ThreeDNSBase, DatasourceName.ThreeDNSOptimism],
  buildPonderConfig({ datasourceConfigOptions, namespace }) {
    const threeDNSBase = datasourceConfigOptions(DatasourceName.ThreeDNSBase);
    const threeDNSOptimism = datasourceConfigOptions(DatasourceName.ThreeDNSOptimism);

    return createPonderConfig({
      networks: {
        ...threeDNSOptimism.networks,
        ...threeDNSBase.networks,
      },
      contracts: {
        [namespace("ThreeDNSToken")]: {
          network: {
            ...threeDNSOptimism.getContractNetwork(threeDNSOptimism.contracts.ThreeDNSToken),
            ...threeDNSBase.getContractNetwork(threeDNSBase.contracts.ThreeDNSToken),
          },
          abi: threeDNSOptimism.contracts.ThreeDNSToken.abi,
        },
        [namespace("Resolver")]: {
          network: {
            ...threeDNSOptimism.getContractNetwork(threeDNSOptimism.contracts.Resolver),
            ...threeDNSBase.getContractNetwork(threeDNSBase.contracts.Resolver),
          },
          abi: threeDNSOptimism.contracts.Resolver.abi,
        },
      },
    });
  },
});
