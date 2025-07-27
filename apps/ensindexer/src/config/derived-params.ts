import type { ENSIndexerConfig } from "@/config/types";
import { isSubgraphCompatible } from "@ensnode/ensnode-sdk";

/**
 * Derived `isSubgraphCompatible` config param based on validated ENSIndexerConfig object.
 */
export const derive_isSubgraphCompatible = <
  CONFIG extends Pick<
    ENSIndexerConfig,
    "plugins" | "healReverseAddresses" | "indexAdditionalResolverRecords"
  >,
>(
  config: CONFIG,
): CONFIG & { isSubgraphCompatible: boolean } => {
  return {
    ...config,
    isSubgraphCompatible: isSubgraphCompatible(config),
  };
};
