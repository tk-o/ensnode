import { buildEnsDbDrizzleClient, buildEnsDbSchema, EnsDbReader } from "@ensnode/ensdb-sdk";

import ensDbConfig from "@/config/ensdb-config";

const ensDbUrl = ensDbConfig.databaseUrl;
const ensIndexerSchemaName = ensDbConfig.databaseSchemaName;

/**
 * Build a ENSDb Schema for Drizzle client using the ENSIndexer Schema name from config.
 */
const ensDbSchema = buildEnsDbSchema(ensIndexerSchemaName);
const ensDbDrizzleClient = buildEnsDbDrizzleClient(ensDbUrl, ensDbSchema);

/**
 * Singleton instance of ENSDbReader for the ENSApi application.
 */
export const ensDbReader = new EnsDbReader(ensDbDrizzleClient, ensDbSchema, ensIndexerSchemaName);
