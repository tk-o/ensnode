import { migrate } from "drizzle-orm/node-postgres/migrator";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deserializeCrossChainIndexingStatusSnapshot,
  serializeCrossChainIndexingStatusSnapshot,
  serializeEnsIndexerPublicConfig,
} from "@ensnode/ensnode-sdk";

import * as ensNodeSchema from "../ensnode";
import { buildEnsDbDrizzleClient } from "../lib/drizzle";
import * as ensDbClientMock from "./ensdb-client.mock";
import { EnsDbWriter } from "./ensdb-writer";
import { EnsNodeMetadataKeys } from "./ensnode-metadata";

// Mock the buildEnsDbDrizzleClient function to return a mock database instance
vi.mock("../lib/drizzle", () => ({ buildEnsDbDrizzleClient: vi.fn() }));

// Mock the drizzle-orm migrator
vi.mock("drizzle-orm/node-postgres/migrator", () => ({ migrate: vi.fn() }));

describe("EnsDbWriter", () => {
  // Mock database query results and methods
  const selectResult = { current: [] as Array<{ value: unknown }> };
  const whereMock = vi.fn(async () => selectResult.current);
  const fromMock = vi.fn(() => ({ where: whereMock }));
  const selectMock = vi.fn(() => ({ from: fromMock }));
  const onConflictDoUpdateMock = vi.fn(async () => undefined);
  const valuesMock = vi.fn(() => ({ onConflictDoUpdate: onConflictDoUpdateMock }));
  const insertMock = vi.fn(() => ({ values: valuesMock }));
  const dbMock = { select: selectMock, insert: insertMock };

  beforeEach(() => {
    selectResult.current = [];
    whereMock.mockClear();
    fromMock.mockClear();
    selectMock.mockClear();
    onConflictDoUpdateMock.mockClear();
    valuesMock.mockClear();
    insertMock.mockClear();
    vi.mocked(migrate).mockClear();
    vi.mocked(buildEnsDbDrizzleClient).mockReturnValue(
      dbMock as unknown as ReturnType<typeof buildEnsDbDrizzleClient>,
    );
  });

  describe("upsertEnsDbVersion", () => {
    it("writes the database version metadata", async () => {
      // arrange
      const client = new EnsDbWriter(
        ensDbClientMock.ensDbUrl,
        ensDbClientMock.ensIndexerSchemaName,
      );

      // act
      await client.upsertEnsDbVersion("0.2.0");

      // assert
      expect(insertMock).toHaveBeenCalledWith(ensNodeSchema.metadata);
      expect(valuesMock).toHaveBeenCalledWith({
        ensIndexerSchemaName: ensDbClientMock.ensIndexerSchemaName,
        key: EnsNodeMetadataKeys.EnsDbVersion,
        value: "0.2.0",
      });
      expect(onConflictDoUpdateMock).toHaveBeenCalledWith({
        target: [ensNodeSchema.metadata.ensIndexerSchemaName, ensNodeSchema.metadata.key],
        set: { value: "0.2.0" },
      });
    });
  });

  describe("upsertEnsIndexerPublicConfig", () => {
    it("serializes and writes the public config", async () => {
      // arrange
      const client = new EnsDbWriter(
        ensDbClientMock.ensDbUrl,
        ensDbClientMock.ensIndexerSchemaName,
      );
      const expectedValue = serializeEnsIndexerPublicConfig(ensDbClientMock.publicConfig);

      // act
      await client.upsertEnsIndexerPublicConfig(ensDbClientMock.publicConfig);

      // assert
      expect(valuesMock).toHaveBeenCalledWith({
        ensIndexerSchemaName: ensDbClientMock.ensIndexerSchemaName,
        key: EnsNodeMetadataKeys.EnsIndexerPublicConfig,
        value: expectedValue,
      });
    });
  });

  describe("upsertIndexingStatusSnapshot", () => {
    it("serializes and writes the indexing status snapshot", async () => {
      // arrange
      const client = new EnsDbWriter(
        ensDbClientMock.ensDbUrl,
        ensDbClientMock.ensIndexerSchemaName,
      );
      const snapshot = deserializeCrossChainIndexingStatusSnapshot(
        ensDbClientMock.serializedSnapshot,
      );
      const expectedValue = serializeCrossChainIndexingStatusSnapshot(snapshot);

      // act
      await client.upsertIndexingStatusSnapshot(snapshot);

      // assert
      expect(valuesMock).toHaveBeenCalledWith({
        ensIndexerSchemaName: ensDbClientMock.ensIndexerSchemaName,
        key: EnsNodeMetadataKeys.EnsIndexerIndexingStatus,
        value: expectedValue,
      });
    });
  });

  describe("migrateEnsNodeSchema", () => {
    it("calls drizzle-orm migrateEnsNodeSchema with the correct parameters", async () => {
      // arrange
      const client = new EnsDbWriter(
        ensDbClientMock.ensDbUrl,
        ensDbClientMock.ensIndexerSchemaName,
      );
      const migrationsDirPath = "/path/to/migrations";

      // act
      await client.migrateEnsNodeSchema(migrationsDirPath);

      // assert
      expect(vi.mocked(migrate)).toHaveBeenCalledWith(dbMock, {
        migrationsFolder: migrationsDirPath,
        migrationsSchema: "ensnode",
      });
    });

    it("propagates errors from the migrateEnsNodeSchema function", async () => {
      // arrange
      const client = new EnsDbWriter(
        ensDbClientMock.ensDbUrl,
        ensDbClientMock.ensIndexerSchemaName,
      );
      const migrationsDirPath = "/path/to/migrations";
      const error = new Error("Migration failed");
      vi.mocked(migrate).mockRejectedValueOnce(error);

      // act & assert
      await expect(client.migrateEnsNodeSchema(migrationsDirPath)).rejects.toThrow(
        "Migration failed",
      );
    });
  });
});
