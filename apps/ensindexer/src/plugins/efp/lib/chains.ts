import { ENSNamespace } from "@ensnode/datasources";
import { base, baseSepolia, mainnet, optimism, optimismSepolia, sepolia } from "viem/chains";

/**
 * Application data model for EFP Deployment Chain ID.
 *
 * EFP has an allowlisted set of supported chains.
 */
export type EFPDeploymentChainId = number;

/**
 * Get the list of EFP Deployment Chain IDs for the ENS Namespace.
 *
 * @param ensNamespace - ENS Namespace to get the EFP Deployment Chain IDs for
 * @returns list of EFP Deployment Chain IDs
 */
export function getEFPDeploymentChainIds(ensNamespace: ENSNamespace): EFPDeploymentChainId[] {
  switch (ensNamespace) {
    case "mainnet":
      return [base.id, optimism.id, mainnet.id];
    case "sepolia":
      return [baseSepolia.id, optimismSepolia.id, sepolia.id];
    default:
      throw new Error(
        `EFP Deployment chainIds are not configured for the ${ensNamespace} ENS Namespace`,
      );
  }
}
