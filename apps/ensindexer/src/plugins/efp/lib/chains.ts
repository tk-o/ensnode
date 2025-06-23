import type { ENSDeploymentChain } from "@ensnode/ens-deployments";
import { base, baseSepolia, mainnet, optimism, optimismSepolia, sepolia } from "viem/chains";

/**
 * Application data model for EFP Deployment Chain ID.
 *
 * EFP has an allowlisted set of supported chains.
 */
export type EFPDeploymentChainId = number;

/**
 * Get the list of EFP Deployment Chain IDs for the ENS Deployment Chain.
 *
 * @param ensDeploymentChain
 * @returns list of EFP Deployment Chain IDs
 */
export function getEFPDeploymentChainIds(
  ensDeploymentChain: ENSDeploymentChain,
): EFPDeploymentChainId[] {
  switch (ensDeploymentChain) {
    case "mainnet":
      return [base.id, optimism.id, mainnet.id];
    case "sepolia":
      return [baseSepolia.id, optimismSepolia.id, sepolia.id];
    default:
      throw new Error(
        `EFP Deployment chainIds are not configured for the ${ensDeploymentChain} ENS Deployment Chain`,
      );
  }
}
