import type { Node } from "@ensnode/utils/types";
import { createConfig } from "ponder";
import { DEPLOYMENT_CONFIG } from "../../lib/globals";
import {
  activateHandlers,
  createPluginNamespace,
  networkConfigForContract,
  networksConfigForChain,
} from "../../lib/plugin-helpers";

// uses the 'base' plugin config for deployments
export const pluginName = "base" as const;

// the Registry/Registrar handlers in this plugin manage subdomains of '.base.eth'
const ownedName = "base.eth" as const;

const { chain, contracts } = DEPLOYMENT_CONFIG[pluginName];
const namespace = createPluginNamespace(ownedName);

// The `base` plugin does not support healing reverse addresses
const canHealReverseAddresses = () => false;

// The `base` plugin does not support reverse root node checking
const isReverseRootNode = (node: Node): boolean => {
  throw new Error(`Cannot check if '${node} is a reverse root node for 'base' plugin`);
};

export const config = createConfig({
  networks: networksConfigForChain(chain),
  contracts: {
    [namespace("Registry")]: {
      network: networkConfigForContract(chain, contracts.Registry),
      abi: contracts.Registry.abi,
    },
    [namespace("Resolver")]: {
      network: networkConfigForContract(chain, contracts.Resolver),
      abi: contracts.Resolver.abi,
      // index Resolver by event signatures, not address
      filter: contracts.Resolver.filter,
    },
    [namespace("BaseRegistrar")]: {
      network: networkConfigForContract(chain, contracts.BaseRegistrar),
      abi: contracts.BaseRegistrar.abi,
    },
    [namespace("EARegistrarController")]: {
      network: networkConfigForContract(chain, contracts.EARegistrarController),
      abi: contracts.EARegistrarController.abi,
    },
    [namespace("RegistrarController")]: {
      network: networkConfigForContract(chain, contracts.RegistrarController),
      abi: contracts.RegistrarController.abi,
    },
  },
});

export const activate = activateHandlers({
  canHealReverseAddresses,
  isReverseRootNode,
  ownedName,
  namespace,
  handlers: [
    import("./handlers/Registry"),
    import("./handlers/Registrar"),
    import("./handlers/Resolver"),
  ],
});
