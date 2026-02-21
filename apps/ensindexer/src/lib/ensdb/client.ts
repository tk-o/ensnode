import config from "@/config";

import { eq } from "drizzle-orm/sql";

import * as schema from "@ensnode/ensnode-schema";
import {
  type CrossChainIndexingStatusSnapshot,
  deserializeCrossChainIndexingStatusSnapshot,
  deserializeEnsIndexerPublicConfig,
  type EnsDbClientMutation,
  type EnsDbClientQuery,
  type EnsIndexerPublicConfig,
  EnsNodeMetadataKeys,
  type SerializedEnsNodeMetadata,
  type SerializedEnsNodeMetadataEnsDbVersion,
  type SerializedEnsNodeMetadataEnsIndexerIndexingStatus,
  type SerializedEnsNodeMetadataEnsIndexerPublicConfig,
  serializeCrossChainIndexingStatusSnapshot,
  serializeEnsIndexerPublicConfig,
} from "@ensnode/ensnode-sdk";

import { makeDrizzle } from "./drizzle";

/**
 * ENSDb Client
 */
export class EnsDbClient implements EnsDbClientQuery, EnsDbClientMutation {
  #db = makeDrizzle({
    databaseSchema: config.databaseSchemaName,
    databaseUrl: config.databaseUrl,
    schema,
  });

  async getEnsDbVersion(): Promise<string | undefined> {
    const record = await this.getEnsNodeMetadata<SerializedEnsNodeMetadataEnsDbVersion>({
      key: EnsNodeMetadataKeys.EnsDbVersion,
    });

    return record;
  }

  async getEnsIndexerPublicConfig(): Promise<EnsIndexerPublicConfig | undefined> {
    const record = await this.getEnsNodeMetadata<SerializedEnsNodeMetadataEnsIndexerPublicConfig>({
      key: EnsNodeMetadataKeys.EnsIndexerPublicConfig,
    });

    if (!record) {
      return undefined;
    }

    return deserializeEnsIndexerPublicConfig(record);
  }

  async getIndexingStatusSnapshot(): Promise<CrossChainIndexingStatusSnapshot | undefined> {
    const record = await this.getEnsNodeMetadata<SerializedEnsNodeMetadataEnsIndexerIndexingStatus>(
      {
        key: EnsNodeMetadataKeys.IndexingStatus,
      },
    );

    if (!record) {
      return undefined;
    }

    return deserializeCrossChainIndexingStatusSnapshot(record);
  }

  async upsertEnsDbVersion(ensDbVersion: string): Promise<void> {
    await this.upsertEnsNodeMetadata({
      key: EnsNodeMetadataKeys.EnsDbVersion,
      value: ensDbVersion,
    });
  }

  async upsertEnsIndexerPublicConfig(
    ensIndexerPublicConfig: EnsIndexerPublicConfig,
  ): Promise<void> {
    await this.upsertEnsNodeMetadata({
      key: EnsNodeMetadataKeys.EnsIndexerPublicConfig,
      value: serializeEnsIndexerPublicConfig(ensIndexerPublicConfig),
    });
  }

  async upsertIndexingStatusSnapshot(
    indexingStatus: CrossChainIndexingStatusSnapshot,
  ): Promise<void> {
    await this.upsertEnsNodeMetadata({
      key: EnsNodeMetadataKeys.IndexingStatus,
      value: serializeCrossChainIndexingStatusSnapshot(indexingStatus),
    });
  }

  /**
   * Get ENSNode metadata record
   *
   * @returns selected record in ENSDb.
   * @throws when exactly one matching metadata record was not found
   */
  private async getEnsNodeMetadata<EnsNodeMetadataType extends SerializedEnsNodeMetadata>(
    metadata: Pick<EnsNodeMetadataType, "key">,
  ): Promise<EnsNodeMetadataType["value"] | undefined> {
    const result = await this.#db
      .select()
      .from(schema.ensNodeMetadata)
      .where(eq(schema.ensNodeMetadata.key, metadata.key));

    if (result.length === 0) {
      return undefined;
    }

    if (result.length === 1 && result[0]) {
      return result[0].value as EnsNodeMetadataType["value"];
    }

    throw new Error(`There must be exactly one ENSNodeMetadata record for '${metadata.key}' key`);
  }

  /**
   * Upsert ENSNode metadata
   *
   * @throws when upsert operation failed.
   */
  private async upsertEnsNodeMetadata<
    EnsNodeMetadataType extends SerializedEnsNodeMetadata = SerializedEnsNodeMetadata,
  >(metadata: EnsNodeMetadataType): Promise<void> {
    await this.#db
      .insert(schema.ensNodeMetadata)
      .values({
        key: metadata.key,
        value: metadata.value,
      })
      .onConflictDoUpdate({
        target: schema.ensNodeMetadata.key,
        set: { value: metadata.value },
      });
  }
}
