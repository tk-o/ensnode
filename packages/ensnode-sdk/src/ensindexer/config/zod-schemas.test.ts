import { describe, expect, it } from "vitest";
import { prettifyError, type ZodSafeParseResult } from "zod/v4";

import { type ENSIndexerVersionInfo, PluginName } from "./types";
import {
  makeDatabaseSchemaNameSchema,
  makeENSIndexerPublicConfigSchema,
  makeENSIndexerVersionInfoSchema,
  makeFullyPinnedLabelSetSchema,
  makeIndexedChainIdsSchema,
  makePluginsListSchema,
} from "./zod-schemas";

describe("ENSIndexer: Config", () => {
  describe("Zod Schemas", () => {
    const formatParseError = <T>(zodParseError: ZodSafeParseResult<T>) =>
      prettifyError(zodParseError.error!);

    describe("Parsing", () => {
      it("can parse database schema name values", () => {
        expect(makeDatabaseSchemaNameSchema().parse("public")).toBe("public");
        expect(makeDatabaseSchemaNameSchema().parse("the_schema")).toBe("the_schema");
        expect(makeDatabaseSchemaNameSchema().parse("theSchema")).toBe("theSchema");

        expect(formatParseError(makeDatabaseSchemaNameSchema().safeParse(1))).toContain(
          "Database schema name must be a string",
        );
      });

      it("can parse a list of plugin name values", () => {
        expect(
          makePluginsListSchema().parse([
            `${PluginName.Subgraph}`,
            `${PluginName.Registrars}`,
            `${PluginName.ProtocolAcceleration}`,
          ]),
        ).toStrictEqual([
          PluginName.Subgraph,
          PluginName.Registrars,
          PluginName.ProtocolAcceleration,
        ]);

        expect(
          formatParseError(
            makePluginsListSchema().safeParse([
              `${PluginName.Subgraph}`,
              `${PluginName.Registrars}`,
              `${PluginName.Subgraph}`,
            ]),
          ),
        ).toContain("Plugins cannot contain duplicate values");

        expect(formatParseError(makePluginsListSchema().safeParse([]))).toMatch(
          /Plugins must be a list of strings with at least one string value/,
        );
      });

      it("can parse indexed chain ID values", () => {
        expect(makeIndexedChainIdsSchema().parse([1, 10, 8543])).toStrictEqual(
          new Set([1, 10, 8543]),
        );

        expect(formatParseError(makeIndexedChainIdsSchema().safeParse("1,10"))).toContain(
          "Indexed Chain IDs must be an array",
        );

        expect(formatParseError(makeIndexedChainIdsSchema().safeParse([]))).toContain(
          "Indexed Chain IDs list must include at least one element",
        );
      });

      it("can parse label set configuration values", () => {
        expect(
          makeFullyPinnedLabelSetSchema().parse({
            labelSetId: "subgraph",
            labelSetVersion: 0,
          }),
        ).toStrictEqual({
          labelSetId: "subgraph",
          labelSetVersion: 0,
        });

        expect(
          formatParseError(
            makeFullyPinnedLabelSetSchema().safeParse({
              labelSetId: "",
              labelSetVersion: 0,
            }),
          ),
        ).toContain("labelSetId must be 1-50 characters long");

        expect(
          formatParseError(
            makeFullyPinnedLabelSetSchema().safeParse({
              labelSetId: "subgraph",
              labelSetVersion: -1,
            }),
          ),
        ).toContain("labelSetVersion must be a non-negative integer");
      });

      it("can parse version info values", () => {
        expect(
          makeENSIndexerVersionInfoSchema().parse({
            nodejs: "v22.22.22",
            ponder: "0.11.25",
            ensDb: "0.32.0",
            ensIndexer: "0.32.0",
            ensNormalize: "1.11.1",
            ensRainbow: "0.32.0",
            ensRainbowSchema: 2,
          } satisfies ENSIndexerVersionInfo),
        ).toStrictEqual({
          nodejs: "v22.22.22",
          ponder: "0.11.25",
          ensDb: "0.32.0",
          ensIndexer: "0.32.0",
          ensNormalize: "1.11.1",
          ensRainbow: "0.32.0",
          ensRainbowSchema: 2,
        } satisfies ENSIndexerVersionInfo);

        expect(
          formatParseError(
            makeENSIndexerVersionInfoSchema().safeParse({
              nodejs: "",
              ponder: "",
              ensDb: "",
              ensIndexer: "",
              ensNormalize: "",
              ensRainbow: "",
              ensRainbowSchema: -1,
            } satisfies ENSIndexerVersionInfo),
          ),
        ).toStrictEqual(`✖ Value must be a non-empty string.
  → at nodejs
✖ Value must be a non-empty string.
  → at ponder
✖ Value must be a non-empty string.
  → at ensDb
✖ Value must be a non-empty string.
  → at ensIndexer
✖ Value must be a non-empty string.
  → at ensNormalize
✖ Value must be a non-empty string.
  → at ensRainbow
✖ Value must be a positive integer (>0).
  → at ensRainbowSchema`);
      });

      it("can parse full ENSIndexerPublicConfig with label set", () => {
        const validConfig = {
          labelSet: {
            labelSetId: "subgraph",
            labelSetVersion: 0,
          },
          indexedChainIds: [1],
          isSubgraphCompatible: true,
          namespace: "mainnet" as const,
          plugins: [PluginName.Subgraph],
          databaseSchemaName: "test_schema",
          versionInfo: {
            nodejs: "v22.22.22",
            ponder: "0.11.25",
            ensDb: "0.32.0",
            ensIndexer: "0.32.0",
            ensNormalize: "1.11.1",
            ensRainbow: "0.32.0",
            ensRainbowSchema: 2,
          } satisfies ENSIndexerVersionInfo,
        };

        const parsedConfig = makeENSIndexerPublicConfigSchema().parse(validConfig);

        // The schema transforms URLs and arrays, so we need to check the transformed values
        expect(parsedConfig.indexedChainIds).toBeInstanceOf(Set);
        expect(Array.from(parsedConfig.indexedChainIds)).toEqual([1]);
        expect(parsedConfig.labelSet).toEqual(validConfig.labelSet);
        expect(parsedConfig.isSubgraphCompatible).toBe(validConfig.isSubgraphCompatible);
        expect(parsedConfig.namespace).toBe(validConfig.namespace);
        expect(parsedConfig.plugins).toEqual(validConfig.plugins);
        expect(parsedConfig.databaseSchemaName).toBe(validConfig.databaseSchemaName);
        expect(parsedConfig.versionInfo).toEqual(validConfig.versionInfo);

        // Test invalid labelSetId
        expect(
          formatParseError(
            makeENSIndexerPublicConfigSchema().safeParse({
              ...validConfig,
              labelSet: { ...validConfig.labelSet, labelSetId: "" },
            }),
          ),
        ).toContain("labelSet.labelSetId must be 1-50 characters long");

        // Test invalid labelSetVersion
        expect(
          formatParseError(
            makeENSIndexerPublicConfigSchema().safeParse({
              ...validConfig,
              labelSet: { ...validConfig.labelSet, labelSetVersion: "not-a-number" },
            }),
          ),
        ).toContain("labelSet.labelSetVersion must be an integer");
      });
    });

    describe("Useful error messages", () => {
      it("can apply custom value labels", () => {
        expect(
          formatParseError(makeDatabaseSchemaNameSchema("databaseSchema").safeParse("")),
        ).toContain("databaseSchema is required and must be a non-empty string.");
        expect(
          formatParseError(makeDatabaseSchemaNameSchema("DATABASE_SCHEMA env var").safeParse("")),
        ).toContain("DATABASE_SCHEMA env var is required and must be a non-empty string.");

        expect(
          formatParseError(
            makePluginsListSchema("PLUGINS env var").safeParse([
              `${PluginName.Subgraph}`,
              `${PluginName.Registrars}`,
              `${PluginName.Subgraph}`,
            ]),
          ),
        ).toContain("PLUGINS env var cannot contain duplicate values");
      });
    });
  });
});
