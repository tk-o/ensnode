import type { EnsApiPublicConfig } from "../ensapi/config/types";
import type { EnsDbPublicConfig } from "../ensdb/config";
import type { EnsIndexerPublicConfig } from "../ensindexer/config/types";
import type { EnsRainbowPublicConfig } from "../ensrainbow/config";

/**
 * Information about the stack of services inside an ENSNode instance.
 */
export interface EnsNodeStackInfo {
  /**
   * ENSApi Public Config
   */
  ensApi: EnsApiPublicConfig;

  /**
   * ENSDb Public Config
   */
  ensDb: EnsDbPublicConfig;

  /**
   * ENSIndexer Public Config
   */
  ensIndexer: EnsIndexerPublicConfig;

  /**
   * ENSRainbow Public Config
   */
  ensRainbow: EnsRainbowPublicConfig;
}

/**
 * Build a complete {@link EnsNodeStackInfo} object from
 * the given public configs of ENSApi and ENSDb.
 */
export function buildEnsNodeStackInfo(
  ensApiPublicConfig: EnsApiPublicConfig,
  ensDbPublicConfig: EnsDbPublicConfig,
  ensIndexerPublicConfig: EnsIndexerPublicConfig,
  ensRainbowPublicConfig: EnsRainbowPublicConfig,
): EnsNodeStackInfo {
  return {
    ensApi: ensApiPublicConfig,
    ensDb: ensDbPublicConfig,
    ensIndexer: ensIndexerPublicConfig,
    ensRainbow: ensRainbowPublicConfig,
  };
}
