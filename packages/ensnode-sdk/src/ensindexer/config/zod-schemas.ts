/**
 * Zod schemas can never be included in the NPM package for ENSNode SDK.
 *
 * The only way to share Zod schemas is to re-export them from
 * `./src/internal.ts` file.
 */
import z from "zod/v4";
import { uniq } from "../../shared";
import {
  ZodCheckFnInput,
  makeBooleanSchema,
  makeChainIdSchema,
  makeENSNamespaceIdSchema,
  makeNonEmptyStringSchema,
  makePortSchema,
  makePositiveIntegerSchema,
  makeUrlSchema,
} from "../../shared/zod-schemas";
import { isSubgraphCompatible } from "./helpers";
import { PluginName } from "./types";
import type { ENSIndexerPublicConfig, IndexedChainIds } from "./types";

/**
 * Makes a schema for parsing {@link IndexedChainIds}.
 */
export const makeIndexedChainIdsSchema = (valueLabel: string = "Indexed Chain IDs") =>
  z
    .array(makeChainIdSchema(valueLabel), {
      error: `${valueLabel} must be an array.`,
    })
    .min(1, { error: `${valueLabel} list must include at least one element.` })
    .transform((v) => new Set(v));

/**
 * Makes a schema for parsing a list of {@link PluginName} items.
 *
 * The list is guaranteed to include at least one item exists, and no duplicates.
 */
export const makePluginsListSchema = (valueLabel: string = "Plugins") =>
  z
    .array(
      z.enum(PluginName, {
        error: `${valueLabel} must be a list with at least one valid plugin name. Valid plugins are: ${Object.values(
          PluginName,
        ).join(", ")}`,
      }),
    )
    .min(1, {
      error: `${valueLabel} must be a list with at least one valid plugin name. Valid plugins are: ${Object.values(
        PluginName,
      ).join(", ")}`,
    })
    .refine((arr) => arr.length === uniq(arr).length, {
      error: `${valueLabel} cannot contain duplicate values.`,
    });

/**
 * Makes a schema for parsing a name for a database schema.
 *
 * The name is guaranteed to be a non-empty string.
 */
export const makeDatabaseSchemaNameSchema = (valueLabel: string = "Database schema name") =>
  z
    .string({ error: `${valueLabel} must be a string` })
    .trim()
    .nonempty({
      error: `${valueLabel} is required and must be a non-empty string.`,
    });

export const makeVersionInfoSchema = (valueLabel: string = "Value") =>
  z.object(
    {
      nodejs: makeNonEmptyStringSchema(),
      ponder: makeNonEmptyStringSchema(),
      ensRainbow: makeNonEmptyStringSchema(),
      ensRainbowSchema: makePositiveIntegerSchema(),
    },
    {
      error: `${valueLabel} must be a valid VersionInfo object.`,
    },
  );

// Invariant: ReverseResolvers plugin requires indexAdditionalResolverRecords
export function invariant_reverseResolversPluginNeedsResolverRecords(
  ctx: ZodCheckFnInput<Pick<ENSIndexerPublicConfig, "plugins" | "indexAdditionalResolverRecords">>,
) {
  const { value: config } = ctx;

  const reverseResolversPluginActive = config.plugins.includes(PluginName.ReverseResolvers);

  if (reverseResolversPluginActive && !config.indexAdditionalResolverRecords) {
    ctx.issues.push({
      code: "custom",
      input: config,
      message: `The '${PluginName.ReverseResolvers}' plugin requires 'indexAdditionalResolverRecords' to be 'true'.`,
    });
  }
}

// Invariant: experimentalResolution requires ReverseResolvers plugin
export function invariant_experimentalResolutionNeedsReverseResolversPlugin(
  ctx: ZodCheckFnInput<Pick<ENSIndexerPublicConfig, "plugins" | "experimentalResolution">>,
) {
  const { value: config } = ctx;

  const reverseResolversPluginActive = config.plugins.includes(PluginName.ReverseResolvers);

  if (config.experimentalResolution && !reverseResolversPluginActive) {
    ctx.issues.push({
      code: "custom",
      input: config,
      message: `'reverseResolversPluginActive' requires the ${PluginName.ReverseResolvers} plugin to be active.`,
    });
  }
}

// Invariant: isSubgraphCompatible requires Subgraph plugin only, and no extra indexing features
export function invariant_isSubgraphCompatibleRequirements(
  ctx: ZodCheckFnInput<
    Pick<
      ENSIndexerPublicConfig,
      "plugins" | "isSubgraphCompatible" | "healReverseAddresses" | "indexAdditionalResolverRecords"
    >
  >,
) {
  const { value: config } = ctx;

  if (config.isSubgraphCompatible !== isSubgraphCompatible(config)) {
    const message = config.isSubgraphCompatible
      ? `'isSubgraphCompatible' requires only the '${PluginName.Subgraph}' plugin to be active. Also, both 'indexAdditionalResolverRecords' and 'healReverseAddresses' must be set to 'false'`
      : `Both 'indexAdditionalResolverRecords' and 'healReverseAddresses' were set to 'false', and the only active plugin was the '${PluginName.Subgraph}' plugin. The 'isSubgraphCompatible' must be set to 'true'`;

    ctx.issues.push({
      code: "custom",
      input: config,
      message,
    });
  }
}

/**
 * ENSIndexer Public Config Schema
 *
 * Makes a Zod schema definition for validating all important settings used
 * during runtime of the ENSIndexer instance.
 */
export const makeENSIndexerPublicConfigSchema = (valueLabel: string = "ENSIndexerPublicConfig") =>
  z
    .object({
      ensAdminUrl: makeUrlSchema(`${valueLabel}.ensAdminUrl`),
      ensNodePublicUrl: makeUrlSchema(`${valueLabel}.ensNodePublicUrl`),
      ensRainbowEndpointUrl: makeUrlSchema(`${valueLabel}.ensRainbowEndpointUrl`),
      experimentalResolution: makeBooleanSchema(`${valueLabel}.experimentalResolution`),
      healReverseAddresses: makeBooleanSchema(`${valueLabel}.healReverseAddresses`),
      indexAdditionalResolverRecords: makeBooleanSchema(
        `${valueLabel}.indexAdditionalResolverRecords`,
      ),
      indexedChainIds: makeIndexedChainIdsSchema(`${valueLabel}.indexedChainIds`),
      isSubgraphCompatible: makeBooleanSchema(`${valueLabel}.isSubgraphCompatible`),
      namespace: makeENSNamespaceIdSchema(`${valueLabel}.namespace`),
      plugins: makePluginsListSchema(`${valueLabel}.plugins`),
      databaseSchemaName: makeDatabaseSchemaNameSchema(`${valueLabel}.databaseSchemaName`),
      port: makePortSchema(`${valueLabel}.port`),
      versionInfo: makeVersionInfoSchema(`${valueLabel}.versionInfo`),
    })
    /**
     * Validations
     *
     * All required data validations must be performed below.
     */
    .check(invariant_reverseResolversPluginNeedsResolverRecords)
    .check(invariant_experimentalResolutionNeedsReverseResolversPlugin)
    .check(invariant_isSubgraphCompatibleRequirements);
