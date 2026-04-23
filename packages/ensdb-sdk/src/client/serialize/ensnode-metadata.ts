import type {
  SerializedCrossChainIndexingStatusSnapshot,
  SerializedEnsDbPublicConfig,
  SerializedEnsIndexerPublicConfig,
  SerializedEnsRainbowPublicConfig,
} from "@ensnode/ensnode-sdk";

import type {
  EnsNodeMetadata,
  EnsNodeMetadataEnsDbVersion,
  EnsNodeMetadataEnsIndexerIndexingStatus,
  EnsNodeMetadataEnsIndexerPublicConfig,
  EnsNodeMetadataKeys,
} from "../ensnode-metadata";

/**
 * Serialized representation of {@link EnsNodeMetadataEnsDbVersion}.
 */
export type SerializedEnsNodeMetadataEnsDbVersion = EnsNodeMetadataEnsDbVersion;

/**
 * Serialized representation of {@link EnsNodeMetadataEnsDbPublicConfig}.
 */
export interface SerializedEnsNodeMetadataEnsDbPublicConfig {
  key: typeof EnsNodeMetadataKeys.EnsDbPublicConfig;
  value: SerializedEnsDbPublicConfig;
}

/**
 * Serialized representation of {@link EnsNodeMetadataEnsIndexerPublicConfig}.
 */
export interface SerializedEnsNodeMetadataEnsIndexerPublicConfig {
  key: typeof EnsNodeMetadataKeys.EnsIndexerPublicConfig;
  value: SerializedEnsIndexerPublicConfig;
}

/**
 * Serialized representation of {@link EnsNodeMetadataEnsRainbowPublicConfig}.
 */
export interface SerializedEnsNodeMetadataEnsRainbowPublicConfig {
  key: typeof EnsNodeMetadataKeys.EnsRainbowPublicConfig;
  value: SerializedEnsRainbowPublicConfig;
}

/**
 * Serialized representation of {@link EnsNodeMetadataEnsIndexerIndexingStatus}.
 */
export interface SerializedEnsNodeMetadataEnsIndexerIndexingStatus {
  key: typeof EnsNodeMetadataKeys.EnsIndexerIndexingStatus;
  value: SerializedCrossChainIndexingStatusSnapshot;
}

/**
 * Serialized representation of {@link EnsNodeMetadata}
 */
export type SerializedEnsNodeMetadata =
  | SerializedEnsNodeMetadataEnsDbVersion
  | SerializedEnsNodeMetadataEnsDbPublicConfig
  | SerializedEnsNodeMetadataEnsIndexerPublicConfig
  | SerializedEnsNodeMetadataEnsRainbowPublicConfig
  | SerializedEnsNodeMetadataEnsIndexerIndexingStatus;
