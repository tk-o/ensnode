import { serializeUrl } from "../../shared/serialize";
import { ENSIndexerPublicConfig, IndexedChainIds } from "./domain-types";
import { SerializedENSIndexerPublicConfig, SerializedIndexedChainIds } from "./serialized-types";

/**
 * Serializes a {@link ChainConfig} object.
 */
export function serializeIndexedChainIds(
  indexedChainIds: IndexedChainIds,
): SerializedIndexedChainIds {
  return Array.from(indexedChainIds);
}
/**
 * Serialize a {@link ENSIndexerPublicConfig} object.
 */
export function serializeENSIndexerPublicConfig(
  config: ENSIndexerPublicConfig,
): SerializedENSIndexerPublicConfig {
  const {
    ensAdminUrl,
    ensNodePublicUrl,
    ensRainbowEndpointUrl,
    indexedChainIds,
    databaseSchemaName,
    experimentalResolution,
    healReverseAddresses,
    indexAdditionalResolverRecords,
    isSubgraphCompatible,
    namespace,
    plugins,
    port,
    versionInfo,
  } = config;

  return {
    ensAdminUrl: serializeUrl(ensAdminUrl),
    ensNodePublicUrl: serializeUrl(ensNodePublicUrl),
    ensRainbowEndpointUrl: serializeUrl(ensRainbowEndpointUrl),
    indexedChainIds: serializeIndexedChainIds(indexedChainIds),
    databaseSchemaName,
    experimentalResolution,
    healReverseAddresses,
    indexAdditionalResolverRecords,
    isSubgraphCompatible,
    namespace,
    plugins,
    port,
    versionInfo,
  } satisfies SerializedENSIndexerPublicConfig;
}
