import { type EnsDbConfig, EnsDbReader } from "@ensnode/ensdb-sdk";
import type { EnsNodeStackInfo } from "@ensnode/ensnode-sdk";

import { buildIndexingStatusCache, type IndexingStatusCache } from "@/cache/indexing-status.cache";
import {
  buildReferralProgramEditionConfigSetCache,
  type ReferralProgramEditionConfigSetCache,
} from "@/cache/referral-program-edition-set.cache";
import { buildEnsNodeStackInfoCache, type EnsNodeStackInfoCache } from "@/cache/stack-info.cache";
import { buildConfigFromEnvironment, type EnsApiConfig } from "@/config/config.schema";
import { buildEnsDbConfigFromEnvironment } from "@/config/ensdb-config";

/**
 * Singleton instances for ENSApi context variables.
 * These are lazily initialized when first accessed through the getters
 * in the exported {@link context} object.
 */
const instances = {
  config: undefined as EnsApiConfig | undefined,
  ensDbConfig: undefined as EnsDbConfig | undefined,
  ensDbClient: undefined as EnsDbReader | undefined,
  indexingStatusCache: undefined as IndexingStatusCache | undefined,
  referralProgramEditionConfigSetCache: undefined as
    | ReferralProgramEditionConfigSetCache
    | undefined,
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
  get ensApiConfig(): EnsApiConfig {
    if (!instances.config) {
      instances.config = buildConfigFromEnvironment(process.env);
    }

    return instances.config;
  },

  get ensDbConfig(): EnsDbConfig {
    if (!instances.ensDbConfig) {
      instances.ensDbConfig = buildEnsDbConfigFromEnvironment(process.env);
    }

    return instances.ensDbConfig;
  },

  get ensDbClient(): EnsDbReader {
    if (!instances.ensDbClient) {
      instances.ensDbClient = new EnsDbReader(
        context.ensDbConfig.ensDbUrl,
        context.ensDbConfig.ensIndexerSchemaName,
      );
    }

    return instances.ensDbClient;
  },

  get ensDb(): EnsDbReader["ensDb"] {
    return context.ensDbClient.ensDb as EnsDbReader["ensDb"];
  },

  get ensIndexerSchema(): EnsDbReader["ensIndexerSchema"] {
    return context.ensDbClient.ensIndexerSchema as EnsDbReader["ensIndexerSchema"];
  },

  get indexingStatusCache(): IndexingStatusCache {
    if (!instances.indexingStatusCache) {
      instances.indexingStatusCache = buildIndexingStatusCache(context.ensDbClient);
    }

    return instances.indexingStatusCache;
  },

  get referralProgramEditionConfigSetCache(): ReferralProgramEditionConfigSetCache {
    if (!instances.referralProgramEditionConfigSetCache) {
      instances.referralProgramEditionConfigSetCache = buildReferralProgramEditionConfigSetCache(
        context.ensApiConfig,
      );
    }

    return instances.referralProgramEditionConfigSetCache;
  },

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
   * @throws {Error} If {@link EnsNodeStackInfo} is not available in the context.
   * @returns The {@link EnsNodeStackInfo}.
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

export default context;
