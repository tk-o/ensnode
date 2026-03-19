import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deserializeCrossChainIndexingStatusSnapshot,
  serializeEnsIndexerPublicConfig,
} from "@ensnode/ensnode-sdk";

import * as ensNodeSchema from "../ensnode";
import { buildEnsDbDrizzleClient } from "../lib/drizzle";
import * as ensDbClientMock from "./ensdb-client.mock";
import { EnsDbReader } from "./ensdb-reader";

// Mock the buildEnsDbDrizzleClient function to return a mock database instance
vi.mock("../lib/drizzle", () => ({ buildEnsDbDrizzleClient: vi.fn() }));

describe("EnsDbReader", () => {
  // Mock database query results and methods
  const selectResult = { current: [] as Array<{ value: unknown }> };
  const whereMock = vi.fn(async () => selectResult.current);
  const fromMock = vi.fn(() => ({ where: whereMock }));
  const selectMock = vi.fn(() => ({ from: fromMock }));
  const onConflictDoUpdateMock = vi.fn(async () => undefined);
  const valuesMock = vi.fn(() => ({ onConflictDoUpdate: onConflictDoUpdateMock }));
  const insertMock = vi.fn(() => ({ values: valuesMock }));
  const executeMock = vi.fn(async () => undefined);
  const txMock = { insert: insertMock, execute: executeMock };
  const transactionMock = vi.fn(async (callback: (tx: typeof txMock) => Promise<void>) =>
    callback(txMock),
  );
  const dbMock = { select: selectMock, insert: insertMock, transaction: transactionMock };

  beforeEach(() => {
    selectResult.current = [];
    whereMock.mockClear();
    fromMock.mockClear();
    selectMock.mockClear();
    onConflictDoUpdateMock.mockClear();
    valuesMock.mockClear();
    insertMock.mockClear();
    executeMock.mockClear();
    transactionMock.mockClear();
    vi.mocked(buildEnsDbDrizzleClient).mockReturnValue(
      dbMock as unknown as ReturnType<typeof buildEnsDbDrizzleClient>,
    );
  });

  describe("getEnsDbVersion", () => {
    it("returns undefined when no record exists", async () => {
      // arrange
      const client = new EnsDbReader(
        ensDbClientMock.ensDbUrl,
        ensDbClientMock.ensIndexerSchemaName,
      );

      // act & assert
      await expect(client.getEnsDbVersion()).resolves.toBeUndefined();

      expect(selectMock).toHaveBeenCalledTimes(1);
      expect(fromMock).toHaveBeenCalledWith(ensNodeSchema.metadata);
    });

    it("returns value when one record exists", async () => {
      // arrange
      selectResult.current = [{ value: "0.1.0" }];

      const client = new EnsDbReader(
        ensDbClientMock.ensDbUrl,
        ensDbClientMock.ensIndexerSchemaName,
      );

      // act & assert
      await expect(client.getEnsDbVersion()).resolves.toBe("0.1.0");
    });

    // This scenario should be impossible due to the primary key constraint on
    // the 'key' column of 'ensnode_metadata' table.
    it("throws when multiple records exist", async () => {
      // arrange
      selectResult.current = [{ value: "0.1.0" }, { value: "0.1.1" }];

      const client = new EnsDbReader(
        ensDbClientMock.ensDbUrl,
        ensDbClientMock.ensIndexerSchemaName,
      );

      // act & assert
      await expect(client.getEnsDbVersion()).rejects.toThrowError(/ensdb_version/i);
    });
  });

  describe("getEnsIndexerPublicConfig", () => {
    it("returns undefined when no record exists", async () => {
      // arrange
      const client = new EnsDbReader(
        ensDbClientMock.ensDbUrl,
        ensDbClientMock.ensIndexerSchemaName,
      );

      // act & assert
      await expect(client.getEnsIndexerPublicConfig()).resolves.toBeUndefined();
    });

    it("deserializes the stored config", async () => {
      // arrange
      const serializedConfig = serializeEnsIndexerPublicConfig(ensDbClientMock.publicConfig);
      selectResult.current = [{ value: serializedConfig }];

      const client = new EnsDbReader(
        ensDbClientMock.ensDbUrl,
        ensDbClientMock.ensIndexerSchemaName,
      );

      // act & assert
      await expect(client.getEnsIndexerPublicConfig()).resolves.toStrictEqual(
        ensDbClientMock.publicConfig,
      );
    });
  });

  describe("getIndexingStatusSnapshot", () => {
    it("deserializes the stored indexing status snapshot", async () => {
      // arrange
      selectResult.current = [{ value: ensDbClientMock.serializedSnapshot }];

      const client = new EnsDbReader(
        ensDbClientMock.ensDbUrl,
        ensDbClientMock.ensIndexerSchemaName,
      );
      const expected = deserializeCrossChainIndexingStatusSnapshot(
        ensDbClientMock.serializedSnapshot,
      );

      // act & assert
      await expect(client.getIndexingStatusSnapshot()).resolves.toStrictEqual(expected);
    });
  });
});
