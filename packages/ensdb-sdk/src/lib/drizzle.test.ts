import { isPgEnum } from "drizzle-orm/pg-core";
import { isTable } from "drizzle-orm/table";
import { describe, expect, it, vi } from "vitest";

import * as abstractEnsIndexerSchema from "../ensindexer";
import { buildEnsDbDrizzleClient, buildEnsDbSchema } from "./drizzle";

vi.mock("drizzle-orm/node-postgres", () => ({
  drizzle: vi.fn(() => "mock-drizzle-client"),
}));

// Re-import after mock to get the mocked version
const { drizzle } = await import("drizzle-orm/node-postgres");

const SCHEMA_NAME = "ensindexer_test";

const DrizzleSchemaSymbol = Symbol.for("drizzle:Schema");

function getSchemaName(obj: unknown): string | undefined {
  return (obj as any)[DrizzleSchemaSymbol];
}

describe("buildEnsDbSchema", () => {
  it("returns an object containing all ENSNode schema exports", () => {
    const schema = buildEnsDbSchema(SCHEMA_NAME);

    expect(schema.metadata).toBeDefined();
  });

  it("returns an object containing all ENSIndexer schema exports", () => {
    const schema = buildEnsDbSchema(SCHEMA_NAME);

    expect(schema.event).toBeDefined();
    expect(schema.v1Domain).toBeDefined();
    expect(schema.registration).toBeDefined();
    expect(schema.registrationType).toBeDefined();
  });

  it("sets the schema name on all ENSIndexer tables", () => {
    const schema = buildEnsDbSchema(SCHEMA_NAME);

    for (const [key] of Object.entries(abstractEnsIndexerSchema)) {
      const value = schema[key as keyof typeof schema];
      if (isTable(value)) {
        expect(getSchemaName(value)).toBe(SCHEMA_NAME);
      }
    }
  });

  it("does not mutate the schema name on ENSNode tables", () => {
    const schema = buildEnsDbSchema(SCHEMA_NAME);

    expect(getSchemaName(schema.metadata)).toBe("ensnode");
  });

  it("sets the schema name on all ENSIndexer enums", () => {
    const schema = buildEnsDbSchema(SCHEMA_NAME);

    for (const [key] of Object.entries(abstractEnsIndexerSchema)) {
      const value = schema[key as keyof typeof schema];
      if (isPgEnum(value)) {
        expect((value as any).schema).toBe(SCHEMA_NAME);
      }
    }
  });

  it("skips relation objects (neither tables nor enums)", () => {
    const schema = buildEnsDbSchema(SCHEMA_NAME);

    for (const [key, value] of Object.entries(schema)) {
      if (key.endsWith("_relations") || key.endsWith("Relations")) {
        expect(isTable(value)).toBe(false);
        expect(isPgEnum(value)).toBe(false);
      }
    }
  });

  it("applies a different schema name to ENSIndexer objects", () => {
    const otherSchemaName = "ensindexer_other";
    const schema = buildEnsDbSchema(otherSchemaName);

    for (const [key] of Object.entries(abstractEnsIndexerSchema)) {
      const value = schema[key as keyof typeof schema];
      if (isTable(value)) {
        expect(getSchemaName(value)).toBe(otherSchemaName);
      }
    }
  });

  it("builds two concrete schemas with respective names, leaving abstract unaffected", () => {
    const schemaNameA = "ensindexer_alpha";
    const schemaNameB = "ensindexer_beta";

    const concreteA = buildEnsDbSchema(schemaNameA);
    const concreteB = buildEnsDbSchema(schemaNameB);

    for (const [key, abstractValue] of Object.entries(abstractEnsIndexerSchema)) {
      const valueA = concreteA[key as keyof typeof concreteA];
      const valueB = concreteB[key as keyof typeof concreteB];

      if (isTable(abstractValue)) {
        expect(getSchemaName(valueA)).toBe(schemaNameA);
        expect(getSchemaName(valueB)).toBe(schemaNameB);
        expect(getSchemaName(abstractValue)).toBeUndefined();
      }
      if (isPgEnum(abstractValue)) {
        expect((valueA as any).schema).toBe(schemaNameA);
        expect((valueB as any).schema).toBe(schemaNameB);
        expect((abstractValue as any).schema).toBeUndefined();
      }
    }

    expect(getSchemaName(concreteA.metadata)).toBe("ensnode");
    expect(getSchemaName(concreteB.metadata)).toBe("ensnode");
  });
});

describe("buildEnsDbDrizzleClient", () => {
  it("calls drizzle with the correct connection config", () => {
    const connectionString = "postgres://user:pass@localhost:5432/ensdb";
    const schema = buildEnsDbSchema(SCHEMA_NAME);

    buildEnsDbDrizzleClient(connectionString, schema);

    expect(drizzle).toHaveBeenCalledWith({
      connection: connectionString,
      schema,
      casing: "snake_case",
      logger: undefined,
    });
  });

  it("passes the logger to drizzle when provided", () => {
    const connectionString = "postgres://user:pass@localhost:5432/ensdb";
    const schema = buildEnsDbSchema(SCHEMA_NAME);
    const logger = { logQuery: vi.fn() };

    buildEnsDbDrizzleClient(connectionString, schema, logger);

    expect(drizzle).toHaveBeenCalledWith(expect.objectContaining({ logger }));
  });
});
