import type { ChainIdString, UrlString } from "../../shared";
import type { ChainConfig, ENSIndexerPublicConfig } from "./domain-types";

/**
 * Serialized representation of {@link ChainConfig}
 */
export type SerializedChainConfig = ChainConfig<UrlString>;

type SerializedChainConfigs = Record<ChainIdString, SerializedChainConfig>;

/**
 * Serialized representation of {@link ENSIndexerPublicConfig}
 */
export type SerializedENSIndexerPublicConfig = ENSIndexerPublicConfig<
  UrlString,
  SerializedChainConfigs
>;
