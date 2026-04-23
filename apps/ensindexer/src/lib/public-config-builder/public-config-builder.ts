import config from "@/config";

import {
  type EnsIndexerPublicConfig,
  type EnsIndexerVersionInfo,
  validateEnsIndexerPublicConfig,
  validateEnsIndexerVersionInfo,
} from "@ensnode/ensnode-sdk";

import { getEnsIndexerVersion, getPackageVersion } from "@/lib/version-info";

export class PublicConfigBuilder {
  /**
   * Immutable ENSIndexer Public Config
   *
   * The cached ENSIndexer Public Config object, which is built and validated
   * on the first call to `getPublicConfig()`, and returned as-is on subsequent calls.
   */
  private immutablePublicConfig: EnsIndexerPublicConfig | undefined;

  /**
   * Get ENSIndexer Public Config
   *
   * Note: ENSIndexer Public Config is cached after the first call, so
   * subsequent calls will return the cached version without rebuilding it.
   *
   * @throws if the built ENSIndexer Public Config does not conform to
   *         the expected schema
   */
  getEnsIndexerPublicConfig(): EnsIndexerPublicConfig {
    if (typeof this.immutablePublicConfig === "undefined") {
      const versionInfo = this.getEnsIndexerVersionInfo();

      this.immutablePublicConfig = validateEnsIndexerPublicConfig({
        ensIndexerSchemaName: config.ensIndexerSchemaName,
        labelSet: config.labelSet,
        indexedChainIds: config.indexedChainIds,
        isSubgraphCompatible: config.isSubgraphCompatible,
        namespace: config.namespace,
        plugins: config.plugins,
        versionInfo,
      });
    }

    return this.immutablePublicConfig;
  }

  /**
   * Get ENSIndexer Version Info
   *
   * @throws if the built ENSIndexer Version Info does not conform to
   *         the expected schema.
   */
  private getEnsIndexerVersionInfo(): EnsIndexerVersionInfo {
    // ENSIndexer version
    const ensIndexerVersion = getEnsIndexerVersion();

    // ENSDb version
    // ENSDb version is always the same as the ENSIndexer version number
    const ensDbVersion = getPackageVersion("@ensnode/ensdb-sdk");

    return validateEnsIndexerVersionInfo({
      ponder: getPackageVersion("ponder"),
      ensDb: ensDbVersion,
      ensIndexer: ensIndexerVersion,
      ensNormalize: getPackageVersion("@adraffy/ens-normalize"),
    });
  }
}
