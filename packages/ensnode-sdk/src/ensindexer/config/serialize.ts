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
    ...remainingConfig
  } = config;

  return {
    ensAdminUrl: serializeUrl(config.ensAdminUrl),
    ensNodePublicUrl: serializeUrl(config.ensNodePublicUrl),
    ensRainbowEndpointUrl: serializeUrl(config.ensRainbowEndpointUrl),
    indexedChainIds: serializeIndexedChainIds(config.indexedChainIds),
    ...remainingConfig,
  } satisfies SerializedENSIndexerPublicConfig;
}
