import { isTable, Table } from "drizzle-orm";
import { isPgEnum } from "drizzle-orm/pg-core";
import { and, eq } from "drizzle-orm/sql";

import {
  type CrossChainIndexingStatusSnapshot,
  deserializeCrossChainIndexingStatusSnapshot,
  deserializeEnsIndexerPublicConfig,
  type EnsIndexerPublicConfig,
} from "@ensnode/ensnode-sdk";

import * as ensIndexerSchema from "../ensindexer";
import * as ensNodeSchema from "../ensnode";
import { buildEnsDbDrizzleClient, type EnsDbDrizzle } from "../lib/drizzle";
import type { EnsNodeDbQueries } from "./ensnode-db-queries";
import { EnsNodeMetadataKeys } from "./ensnode-metadata";
import type {
  SerializedEnsNodeMetadata,
  SerializedEnsNodeMetadataEnsDbVersion,
  SerializedEnsNodeMetadataEnsIndexerIndexingStatus,
  SerializedEnsNodeMetadataEnsIndexerPublicConfig,
} from "./serialize/ensnode-metadata";

/**
 * ENSDb Reader
 *
 * Allows querying an ENSDb instance, including ENSNode Metadata records,
 * as well as complex queries across multiple database schemas in ENSDb.
 */
export class EnsDbReader implements EnsNodeDbQueries {
  /**
   * Drizzle client for ENSDb.
   */
  protected drizzleClient: EnsDbDrizzle;

  /**
   * References the ENSIndexer instance's database schema in ENSDb.
   *
   * It is required to scope the ENSNode metadata records to
   * a specific ENSIndexer instance in ENSDb.
   */
  protected ensIndexerSchemaName: string;

  /**
   * @param ensDbConnectionString connection string for ENSDb Postgres database
   * @param ensIndexerSchemaName reference string for ENSIndexer instance
   */
  constructor(ensDbConnectionString: string, ensIndexerSchemaName: string) {
    EnsDbReader.bindEnsIndexerSchemaWithName(ensIndexerSchemaName);
    this.drizzleClient = buildEnsDbDrizzleClient(ensDbConnectionString);
    this.ensIndexerSchemaName = ensIndexerSchemaName;
  }

  /**
   * Getter for the Drizzle client for ENSDb instance
   *
   * Useful while working on complex queries for ENSDb.
   */
  get client(): EnsDbDrizzle {
    return this.drizzleClient;
  }

  /**
   * Bind an ENSIndexer Schema definition with a specific instance of
   * ENSIndexer Schema in ENSDb.
   *
   * ENSIndexer Schema definition does not have a fixed database schema name,
   * as it is determined by Ponder when starting up the ENSIndexer instance.
   *
   * This function allows to bind the ENSIndexer Schema definition with
   * the correct database schema name for the ENSIndexer instance we want to
   * reference when interacting with ENSDb.
   *
   * @param ensIndexerSchemaName - The name of the ENSIndexer Schema instance in ENSDb.
   *
   * Note: this function is a replacement for `setDatabaseSchema` from `@ponder/client`.
   */
  static bindEnsIndexerSchemaWithName(ensIndexerSchemaName: string): void {
    for (const dbObjectDef of Object.values(ensIndexerSchema)) {
      if (isTable(dbObjectDef)) {
        // @ts-expect-error - Drizzle's Table type for the schema symbol is
        // not typed in a way that allows us to set it directly,
        // but we know it exists and can be set.
        dbObjectDef[Table.Symbol.Schema] = ensIndexerSchemaName;
      } else if (isPgEnum(dbObjectDef)) {
        // @ts-expect-error - Drizzle's PgEnum type for the schema symbol is
        // typed as readonly, but we need to set it here so
        // the output schema definition has the correct schema for
        // all table and enum objects.
        dbObjectDef.schema = ensIndexerSchemaName;
      }
    }
  }
  /**
   * @inheritdoc
   */
  async getEnsDbVersion(): Promise<string | undefined> {
    const record = await this.getEnsNodeMetadata<SerializedEnsNodeMetadataEnsDbVersion>({
      key: EnsNodeMetadataKeys.EnsDbVersion,
    });

    return record;
  }

  /**
   * @inheritdoc
   */
  async getEnsIndexerPublicConfig(): Promise<EnsIndexerPublicConfig | undefined> {
    const record = await this.getEnsNodeMetadata<SerializedEnsNodeMetadataEnsIndexerPublicConfig>({
      key: EnsNodeMetadataKeys.EnsIndexerPublicConfig,
    });

    if (!record) {
      return undefined;
    }

    return deserializeEnsIndexerPublicConfig(record);
  }

  /**
   * @inheritdoc
   */
  async getIndexingStatusSnapshot(): Promise<CrossChainIndexingStatusSnapshot | undefined> {
    const record = await this.getEnsNodeMetadata<SerializedEnsNodeMetadataEnsIndexerIndexingStatus>(
      {
        key: EnsNodeMetadataKeys.EnsIndexerIndexingStatus,
      },
    );

    if (!record) {
      return undefined;
    }

    return deserializeCrossChainIndexingStatusSnapshot(record);
  }

  /**
   * Get ENSNode Metadata record
   *
   * @returns selected record in ENSDb.
   * @throws when more than one matching metadata record is found
   *         (should be impossible given the composite PK constraint on
   *         'ensIndexerSchemaName' and 'key')
   */
  private async getEnsNodeMetadata<EnsNodeMetadataType extends SerializedEnsNodeMetadata>(
    metadata: Pick<EnsNodeMetadataType, "key">,
  ): Promise<EnsNodeMetadataType["value"] | undefined> {
    const result = await this.drizzleClient
      .select()
      .from(ensNodeSchema.metadata)
      .where(
        and(
          eq(ensNodeSchema.metadata.ensIndexerSchemaName, this.ensIndexerSchemaName),
          eq(ensNodeSchema.metadata.key, metadata.key),
        ),
      );

    if (result.length === 0) {
      return undefined;
    }

    if (result.length === 1 && result[0]) {
      return result[0].value as EnsNodeMetadataType["value"];
    }

    throw new Error(`There must be exactly one ENSNodeMetadata record for '${metadata.key}' key`);
  }
}
