import { createPublicClient, fallback, http, type PublicClient } from "viem";

import { getENSRootChainId } from "@ensnode/datasources";
import { buildRpcConfigsFromEnv, RpcConfigsSchema } from "@ensnode/ensnode-sdk/internal";

import ensApiContext from "@/context";

let publicClientImmutable: PublicClient | undefined;

/**
 * Build a viem#PublicClient for the root chain of the ENS namespace.
 */
function buildPublicClientForRootChain(): PublicClient {
  const { namespace } = ensApiContext.stackInfo.ensIndexer;
  const rootChainId = getENSRootChainId(namespace);

  const unvalidatedRpcConfigs = buildRpcConfigsFromEnv(process.env, namespace);
  const rpcConfigs = RpcConfigsSchema.parse(unvalidatedRpcConfigs);
  const rpcConfig = rpcConfigs.get(rootChainId);

  if (!rpcConfig) {
    throw new Error(`Invariant: ENSApi does not have an RPC to chain id '${rootChainId}'.`);
  }

  // Create an viem#PublicClient that uses a fallback() transport with all specified HTTP RPCs
  return createPublicClient({
    transport: fallback(rpcConfig.httpRPCs.map((url) => http(url.toString()))),
  });
}

/**
 * Get the cached viem#PublicClient for the root chain of the ENS namespace.
 */
export function getPublicClientForRootChain(): PublicClient {
  if (typeof publicClientImmutable === "undefined") {
    publicClientImmutable = buildPublicClientForRootChain();
  }

  return publicClientImmutable;
}
