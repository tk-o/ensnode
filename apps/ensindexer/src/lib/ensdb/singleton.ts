import config from "@/config";

import { buildEnsDbDrizzleClient, buildEnsDbSchema, EnsDbWriter } from "@ensnode/ensdb-sdk";

const { databaseUrl: ensDbConnectionString, databaseSchemaName: ensIndexerSchemaName } = config;

/**
 * Build a ENSDb Schema for Drizzle client using the ENSIndexer Schema name from config.
 */
const ensDbSchema = buildEnsDbSchema(ensIndexerSchemaName);
const ensDbDrizzleClient = buildEnsDbDrizzleClient(ensDbConnectionString, ensDbSchema);

/**
 * Singleton instance of ENSDbWriter for the ENSIndexer application.
 */
export const ensDbWriter = new EnsDbWriter(ensDbDrizzleClient, ensDbSchema, ensIndexerSchemaName);
