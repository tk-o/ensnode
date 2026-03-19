import { migrate } from "drizzle-orm/node-postgres/migrator";

import {
  type CrossChainIndexingStatusSnapshot,
  type EnsIndexerPublicConfig,
  serializeCrossChainIndexingStatusSnapshot,
  serializeEnsIndexerPublicConfig,
} from "@ensnode/ensnode-sdk";

import * as ensNodeSchema from "../ensnode";
import { EnsDbReader } from "./ensdb-reader";
import type { EnsNodeDbMigrations } from "./ensnode-db-migrations";
import type { EnsNodeDbMutations } from "./ensnode-db-mutations";
import { EnsNodeMetadataKeys } from "./ensnode-metadata";
import type { SerializedEnsNodeMetadata } from "./serialize/ensnode-metadata";

/**
 * ENSDb Writer
 *
 * Allows updating an ENSDb instance, including:
 * - executing database migrations for ENSNode Schema,
 * - updating ENSNode Metadata records in ENSDb for the given ENSIndexer instance.
 */
export class EnsDbWriter extends EnsDbReader implements EnsNodeDbMutations, EnsNodeDbMigrations {
  /**
   * @inheritdoc
   */
  async migrate(migrationsDirPath: string): Promise<void> {
    return migrate(this.drizzleClient, {
      migrationsFolder: migrationsDirPath,
      migrationsSchema: "ensnode",
    });
  }

  /**
   * @inheritdoc
   */
  async upsertEnsDbVersion(ensDbVersion: string): Promise<void> {
    await this.upsertEnsNodeMetadata({
      key: EnsNodeMetadataKeys.EnsDbVersion,
      value: ensDbVersion,
    });
  }

  /**
   * @inheritdoc
   */
  async upsertEnsIndexerPublicConfig(
    ensIndexerPublicConfig: EnsIndexerPublicConfig,
  ): Promise<void> {
    await this.upsertEnsNodeMetadata({
      key: EnsNodeMetadataKeys.EnsIndexerPublicConfig,
      value: serializeEnsIndexerPublicConfig(ensIndexerPublicConfig),
    });
  }

  /**
   * @inheritdoc
   */
  async upsertIndexingStatusSnapshot(
    indexingStatus: CrossChainIndexingStatusSnapshot,
  ): Promise<void> {
    await this.upsertEnsNodeMetadata({
      key: EnsNodeMetadataKeys.EnsIndexerIndexingStatus,
      value: serializeCrossChainIndexingStatusSnapshot(indexingStatus),
    });
  }

  /**
   * Upsert ENSNode metadata
   *
   * @throws when upsert operation failed.
   */
  private async upsertEnsNodeMetadata(metadata: SerializedEnsNodeMetadata): Promise<void> {
    await this.drizzleClient
      .insert(ensNodeSchema.metadata)
      .values({
        ensIndexerSchemaName: this.ensIndexerSchemaName,
        key: metadata.key,
        value: metadata.value,
      })
      .onConflictDoUpdate({
        target: [ensNodeSchema.metadata.ensIndexerSchemaName, ensNodeSchema.metadata.key],
        set: { value: metadata.value },
      });
  }
}
