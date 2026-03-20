import config from "@/config";

import { EnsDbWriter } from "@ensnode/ensdb-sdk";

const { databaseUrl: ensDbUrl, databaseSchemaName: ensIndexerSchemaName } = config;

/**
 * Singleton instance of ENSDbWriter for the ENSIndexer application.
 */
export const ensDbWriter = new EnsDbWriter(ensDbUrl, ensIndexerSchemaName);
