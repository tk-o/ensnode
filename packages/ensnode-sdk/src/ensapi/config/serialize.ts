import type { SerializedEnsApiPublicConfig } from "./serialized-types";
import type { EnsApiPublicConfig } from "./types";

/**
 * Serialize a {@link EnsApiPublicConfig} object.
 */
export function serializeEnsApiPublicConfig(
  config: EnsApiPublicConfig,
): SerializedEnsApiPublicConfig {
  const { theGraphFallback, versionInfo } = config;

  return {
    theGraphFallback,
    versionInfo,
  } satisfies SerializedEnsApiPublicConfig;
}

/**
 * Serialize a {@link EnsApiPublicConfig} object.
 *
 * @deprecated Use {@link serializeEnsApiPublicConfig} instead.
 */
export const serializeENSApiPublicConfig = serializeEnsApiPublicConfig;
