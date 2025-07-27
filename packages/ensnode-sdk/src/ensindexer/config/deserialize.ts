import { prettifyError } from "zod/v4";
import type { ENSIndexerPublicConfig } from "./domain-types";
import type { SerializedENSIndexerPublicConfig } from "./serialized-types";
import { ENSIndexerPublicConfigSchema } from "./zod-schemas";

/**
 * Serialize a {@link ENSIndexerPublicConfig} object.
 */
export function deserializeENSIndexerPublicConfig(
  maybeConfig: SerializedENSIndexerPublicConfig,
): ENSIndexerPublicConfig {
  const parsed = ENSIndexerPublicConfigSchema.safeParse(maybeConfig);

  if (parsed.error) {
    throw new Error(`Cannot deserialize ENSIndexerPublicConfig:\n${prettifyError(parsed.error)}\n`);
  }

  return parsed.data;
}
