import { publicClients } from "ponder:api";
import config from "@/config";
import ponderConfig from "@/ponder/config";
import type { ENSIndexerIndexingStatus } from "@ensnode/ensnode-sdk";
import { type IndexedChainsBlockRefs, fetchIndexedChainsBlockRefs } from "@ensnode/ponder-metadata";

interface BuildIndexingStatusArgs {
  indexedChainsBlockRefs: IndexedChainsBlockRefs;
}

export function buildIndexingStatus({ indexedChainsBlockRefs }: BuildIndexingStatusArgs) {}

/**
 * A promise that either resolves to the requested value,
 * or in case of a timeout, rejects and terminates the ENSIndexer application.
 *
 * ENSIndexer cannot start if `indexedChainsBlockRefs` fails to resolve successfully.
 */
export const indexedChainsBlockRefs = fetchIndexedChainsBlockRefs(
  config.ensIndexerPrivateUrl,
  ponderConfig,
  publicClients,
).catch((error) => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.error(`Terminating ENSNode instance: ${errorMessage}`);
  process.exit(1);
});
