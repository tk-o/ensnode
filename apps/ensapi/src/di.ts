/**
 * ENSApi Dependency Injection Container
 *
 * This module defines a simple dependency injection container for
 * the ENSApi instance. It provides a centralized place to manage and
 * access shared instances of configuration, clients, caches, and
 * other resources used throughout the ENSApi codebase.
 */

import type { PublicClient } from "viem";

import { type EnsDbConfig, EnsDbReader } from "@ensnode/ensdb-sdk";
import type { ENSNamespaceId, EnsNodeStackInfo } from "@ensnode/ensnode-sdk";

import { buildIndexingStatusCache, type IndexingStatusCache } from "@/cache/indexing-status.cache";
import {
  buildReferralProgramEditionConfigSetCache,
  type ReferralProgramEditionConfigSetCache,
} from "@/cache/referral-program-edition-set.cache";
import { buildEnsNodeStackInfoCache, type EnsNodeStackInfoCache } from "@/cache/stack-info.cache";
import { buildConfigFromEnvironment, type EnsApiConfig } from "@/config/config.schema";
import { buildEnsDbConfigFromEnvironment } from "@/config/ensdb-config";
import { buildPublicClientForRootChain } from "@/lib/public-client";

/**
 * Creates a new ENSApi context
 *
 * The context is a container for ENSApi variables that can be imported and used
 * in any module within the ENSApi codebase without needing to be passed down
 * through function parameters. The context is created with lazy-initialized
 * getters for each variable, so that the instances are only created when they
 * are first accessed.
 */
function createContext() {
  /**
   * Singleton instances for ENSApi context variables.
   * These are lazily initialized when first accessed through the getters.
   */
  const instances = {
    config: undefined as EnsApiConfig | undefined,
    ensDbConfig: undefined as EnsDbConfig | undefined,
    ensDbClient: undefined as EnsDbReader | undefined,
    ensNamespace: undefined as ENSNamespaceId | undefined,
    indexingStatusCache: undefined as IndexingStatusCache | undefined,
    referralProgramEditionConfigSetCache: undefined as
      | ReferralProgramEditionConfigSetCache
      | undefined,
    publicClientRootChain: undefined as PublicClient | undefined,
    stackInfoCache: undefined as EnsNodeStackInfoCache | undefined,
    stackInfo: undefined as EnsNodeStackInfo | undefined,
  };

  /**
   * ENSApi Context
   *
   * This is a container for ENSApi context variables that can be imported and used
   * in any module within the ENSApi codebase without needing to be passed down
   * through function parameters.
   */
  const context = {
    /**
     * Get a lazy-initialized instance of {@link EnsApiConfig} from the ENSApi context.
     */
    get ensApiConfig(): EnsApiConfig {
      if (!instances.config) {
        instances.config = buildConfigFromEnvironment(process.env);
      }

      return instances.config;
    },

    /**
     * Get lazy-initialized instance of {@link EnsDbConfig} from the ENSApi context.
     */
    get ensDbConfig(): EnsDbConfig {
      if (!instances.ensDbConfig) {
        instances.ensDbConfig = buildEnsDbConfigFromEnvironment(process.env);
      }

      return instances.ensDbConfig;
    },

    /**
     * Get a lazy-initialized instance of {@link EnsDbReader} from the ENSApi context.
     */
    get ensDbClient(): EnsDbReader {
      if (!instances.ensDbClient) {
        instances.ensDbClient = new EnsDbReader(
          context.ensDbConfig.ensDbUrl,
          context.ensDbConfig.ensIndexerSchemaName,
        );
      }

      return instances.ensDbClient;
    },

    /**
     * Convenience getter for the `ensDb` property from the {@link context.ensDbClient} instance in the ENSApi context.
     */
    get ensDb(): EnsDbReader["ensDb"] {
      return context.ensDbClient.ensDb as EnsDbReader["ensDb"];
    },

    /**
     * Convenience getter for the `ensIndexerSchema` property from the {@link context.ensDbClient} instance in the ENSApi context.
     */
    get ensIndexerSchema(): EnsDbReader["ensIndexerSchema"] {
      return context.ensDbClient.ensIndexerSchema as EnsDbReader["ensIndexerSchema"];
    },

    /**
     * Convenience getter for the `namespace` property from the {@link context.stackInfo.ensIndexer} object in the ENSApi context.
     */
    get ensNamespace(): ENSNamespaceId {
      return context.stackInfo.ensIndexer.namespace;
    },

    /**
     * Get a lazy-initialized instance of {@link IndexingStatusCache} from the ENSApi context.
     */
    get indexingStatusCache(): IndexingStatusCache {
      if (!instances.indexingStatusCache) {
        instances.indexingStatusCache = buildIndexingStatusCache(context.ensDbClient);
      }

      return instances.indexingStatusCache;
    },

    /**
     * Get a lazy-initialized instance of {@link PublicClient} for the root chain of the ENS namespace from the ENSApi context.
     */
    get publicClientRootChain(): PublicClient {
      if (!instances.publicClientRootChain) {
        instances.publicClientRootChain = buildPublicClientForRootChain(context.ensNamespace);
      }

      return instances.publicClientRootChain;
    },

    /**
     * Get a lazy-initialized instance of {@link ReferralProgramEditionConfigSetCache} from the ENSApi context.
     */
    get referralProgramEditionConfigSetCache(): ReferralProgramEditionConfigSetCache {
      if (!instances.referralProgramEditionConfigSetCache) {
        instances.referralProgramEditionConfigSetCache = buildReferralProgramEditionConfigSetCache(
          context.ensApiConfig,
        );
      }

      return instances.referralProgramEditionConfigSetCache;
    },

    /**
     * Get a lazy-initialized instance of {@link EnsNodeStackInfoCache} from the ENSApi context.
     */
    get stackInfoCache(): EnsNodeStackInfoCache {
      if (!instances.stackInfoCache) {
        instances.stackInfoCache = buildEnsNodeStackInfoCache(
          context.ensApiConfig,
          context.ensDbClient,
        );
      }

      return instances.stackInfoCache;
    },

    /**
     * Gets the {@link EnsNodeStackInfo} from the context.
     *
     * This getter will return the successfully cached value of {@link context.stackInfoCache}.
     *
     * @throws {Error} If {@link EnsNodeStackInfo} is not available in the context.
     */
    get stackInfo(): EnsNodeStackInfo {
      if (!instances.stackInfo) {
        throw new Error(`Invariant: EnsNodeStackInfo is not available in context.`);
      }

      return instances.stackInfo;
    },

    /**
     * Sets the {@link EnsNodeStackInfo} in the context. Can only be set once.
     *
     * @param stackInfo - The {@link EnsNodeStackInfo} to set in the context.
     */
    set stackInfo(stackInfo: EnsNodeStackInfo) {
      if (typeof instances.stackInfo !== "undefined") {
        return;
      }

      instances.stackInfo = stackInfo;
    },
  };

  return context;
}

/**
 * ENSApi Dependency Injection Container
 */
const di = {
  context: createContext(),
};

/**
 * Recreates the context in the ENSApi Dependency Injection Container
 *
 * This is useful during development for hot-reloading to ensure that
 * the context is recreated with the latest code changes, and
 * in testing to reset the context between tests.
 *
 * It should not be used in production code.
 */
export function recreateContext() {
  di.context = createContext();
}

export default di;
