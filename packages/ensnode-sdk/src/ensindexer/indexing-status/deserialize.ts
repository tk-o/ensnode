import { prettifyError } from "zod/v4";
import type { ENSIndexerIndexingStatus } from "./domain-types";
import type { SerializedENSIndexerIndexingStatus } from "./serialized-types";
import { makeENSIndexerIndexingStatusSchema } from "./zod-schemas";

/**
 * Serialize a {@link ENSIndexerIndexingStatus} object.
 */
export function deserializeENSIndexerIndexingStatus(
  maybeConfig: SerializedENSIndexerIndexingStatus,
  valueLabel?: string,
): ENSIndexerIndexingStatus {
  const schema = makeENSIndexerIndexingStatusSchema(valueLabel);
  const parsed = schema.safeParse(maybeConfig);

  if (parsed.error) {
    throw new Error(
      `Cannot deserialize ENSIndexerIndexingStatus:\n${prettifyError(parsed.error)}\n`,
    );
  }

  return parsed.data;
}
