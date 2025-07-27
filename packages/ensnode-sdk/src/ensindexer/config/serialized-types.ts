import type { ChainId, UrlString } from "../../shared";
import type { ENSIndexerPublicConfig } from "./domain-types";

export type SerializedIndexedChainIds = Array<ChainId>;

/**
 * Serialized representation of {@link ENSIndexerPublicConfig}
 */
export type SerializedENSIndexerPublicConfig = ENSIndexerPublicConfig<
  UrlString,
  SerializedIndexedChainIds
>;
