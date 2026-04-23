import type {
  CrossChainIndexingStatusSnapshot,
  EnsDbPublicConfig,
  EnsIndexerPublicConfig,
  EnsRainbowPublicConfig,
} from "@ensnode/ensnode-sdk";

/**
 * Keys used to distinguish records in `ensnode_metadata` table in the ENSDb.
 */
export const EnsNodeMetadataKeys = {
  EnsDbVersion: "ensdb_version",
  EnsDbPublicConfig: "ensdb_public_config",
  EnsIndexerPublicConfig: "ensindexer_public_config",
  EnsRainbowPublicConfig: "ensrainbow_public_config",
  EnsIndexerIndexingStatus: "ensindexer_indexing_status",
} as const;

export type EnsNodeMetadataKey = (typeof EnsNodeMetadataKeys)[keyof typeof EnsNodeMetadataKeys];

export interface EnsNodeMetadataEnsDbVersion {
  key: typeof EnsNodeMetadataKeys.EnsDbVersion;
  value: string;
}

export interface EnsNodeMetadataEnsDbPublicConfig {
  key: typeof EnsNodeMetadataKeys.EnsDbPublicConfig;
  value: EnsDbPublicConfig;
}

export interface EnsNodeMetadataEnsIndexerPublicConfig {
  key: typeof EnsNodeMetadataKeys.EnsIndexerPublicConfig;
  value: EnsIndexerPublicConfig;
}

export interface EnsNodeMetadataEnsRainbowPublicConfig {
  key: typeof EnsNodeMetadataKeys.EnsRainbowPublicConfig;
  value: EnsRainbowPublicConfig;
}

export interface EnsNodeMetadataEnsIndexerIndexingStatus {
  key: typeof EnsNodeMetadataKeys.EnsIndexerIndexingStatus;
  value: CrossChainIndexingStatusSnapshot;
}

/**
 * ENSNode Metadata
 *
 * Union type gathering all variants of ENSNode Metadata.
 */
export type EnsNodeMetadata =
  | EnsNodeMetadataEnsDbVersion
  | EnsNodeMetadataEnsDbPublicConfig
  | EnsNodeMetadataEnsIndexerPublicConfig
  | EnsNodeMetadataEnsRainbowPublicConfig
  | EnsNodeMetadataEnsIndexerIndexingStatus;
