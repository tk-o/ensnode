/**
 * Utilities for Drizzle ORM integration with ENSDb.
 */
import type { Logger as DrizzleLogger } from "drizzle-orm/logger";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

import * as ensIndexerSchema from "../ensindexer";
import * as ensNodeSchema from "../ensnode";

/**
 * ENSDb Schema
 *
 * Represents the combined database schema for ENSDb,
 * including both the ENSIndexer Schema and the ENSNode Schema.
 */
export const ensDbSchema = { ...ensIndexerSchema, ...ensNodeSchema };

export type EnsDbSchema = typeof ensDbSchema;

/**
 * Drizzle client for ENSDb.
 */
export type EnsDbDrizzle = NodePgDatabase<EnsDbSchema>;

/**
 * Build a Drizzle client for ENSDb.
 * @param connectionString - The connection string for the ENSDb.
 * @param logger - Optional Drizzle logger for query logging.
 * @returns A Drizzle client for ENSDb.
 */
export function buildEnsDbDrizzleClient(
  connectionString: string,
  logger?: DrizzleLogger,
): EnsDbDrizzle {
  return drizzle({
    connection: connectionString,
    schema: ensDbSchema,
    casing: "snake_case",
    logger,
  });
}
