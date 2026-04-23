import { minutesToSeconds } from "date-fns";

import type { EnsDbReader } from "@ensnode/ensdb-sdk";
import {
  buildEnsNodeStackInfo,
  type CachedResult,
  type EnsNodeStackInfo,
  SWRCache,
} from "@ensnode/ensnode-sdk";

import { buildEnsApiPublicConfig, type EnsApiConfig } from "@/config/config.schema";
import { makeLogger } from "@/lib/logger";

const logger = makeLogger("stack-info.cache");

export type EnsNodeStackInfoCache = SWRCache<EnsNodeStackInfo>;

/**
 * Build an SWR Cache for {@link EnsNodeStackInfo}.
 *
 * Once successfully loaded, the {@link EnsNodeStackInfo} is cached indefinitely and
 * never revalidated. This ensures the JSON is only fetched once during
 * the application lifecycle.
 *
 * Configuration:
 * - ttl: Infinity - Never expires once cached
 * - errorTtl: 1 minute - If loading fails, retry on next access after 1 minute
 * - proactiveRevalidationInterval: undefined - No proactive revalidation
 * - proactivelyInitialize: true - Load immediately on startup
 */
export function buildEnsNodeStackInfoCache(
  ensApiConfig: EnsApiConfig,
  ensDbClient: EnsDbReader,
): EnsNodeStackInfoCache {
  return new SWRCache<EnsNodeStackInfo>({
    /**
     * Loads the ENSNode stack info, either from cache if available,
     * or by building it from the public configs of ENSApi and ENSDb.
     *
     * The ENSNode Stack Info object is considered immutable for
     * the lifecycle of an ENSApi process instance, so once it is successfully
     * loaded, it will be cached indefinitely.
     */
    fn: async function loadEnsNodeStackInfo(
      cachedResult?: CachedResult<EnsNodeStackInfo>,
    ): Promise<EnsNodeStackInfo> {
      if (cachedResult && !(cachedResult.result instanceof Error)) {
        return cachedResult.result;
      }
      const [ensIndexerPublicConfig, ensRainbowPublicConfig] = await Promise.all([
        ensDbClient.getEnsIndexerPublicConfig(),
        ensDbClient.getEnsRainbowPublicConfig(),
      ]);

      if (!ensIndexerPublicConfig) {
        throw new Error("EnsIndexerPublicConfig is not available in ENSDb");
      }

      if (!ensRainbowPublicConfig) {
        throw new Error("EnsRainbowPublicConfig is not available in ENSDb");
      }

      const ensApiPublicConfig = buildEnsApiPublicConfig(ensApiConfig, ensIndexerPublicConfig);
      const ensDbPublicConfig = await ensDbClient.buildEnsDbPublicConfig();

      const stackInfo = buildEnsNodeStackInfo(
        ensApiPublicConfig,
        ensDbPublicConfig,
        ensIndexerPublicConfig,
        ensRainbowPublicConfig,
      );

      logger.info(`Successfully loaded 'EnsNodeStackInfo' into cache`);

      return stackInfo;
    },
    ttl: Number.POSITIVE_INFINITY,
    errorTtl: minutesToSeconds(1),
    proactiveRevalidationInterval: undefined,
    proactivelyInitialize: true,
  });
}
