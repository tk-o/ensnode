import z from "zod/v4";
import type { ChainId } from "../../shared/domain-types";
import {
  BooleanSchema,
  ChainIdSchema,
  ENSNamespaceSchema,
  PortSchema,
  PositiveIntegerSchema,
  UrlSchema,
} from "../../shared/zod-schemas";
import { uniq } from "../../utils/collections";
import { PluginName } from "./domain-types";
import type { ENSIndexerPublicConfig, IndexedChainIds } from "./domain-types";
import { isSubgraphCompatible } from "./helpers";

/**
 * Parses {@link IndexedChainIds}.
 */
export const IndexedChainIdsSchema = z.array(ChainIdSchema).transform((v) => new Set(v));

/**
 * Parses a list of {@link PluginName} items.
 *
 * The list is guaranteed to include at least one item exists, and no duplicates.
 */
export const PluginsSchema = z
  .array(
    z.enum(PluginName, {
      error: `PLUGINS must be a list with at least one valid plugin name. Valid plugins are: ${Object.values(
        PluginName,
      ).join(", ")}`,
    }),
  )
  .min(1, {
    error: `PLUGINS must be a list with at least one valid plugin name. Valid plugins are: ${Object.values(
      PluginName,
    ).join(", ")}`,
  })
  .refine((arr) => arr.length === uniq(arr).length, {
    error: "PLUGINS cannot contain duplicate values",
  });

/**
 * Parses a name for a database schema.
 *
 * The name is guaranteed to be a non-empty string.
 */
export const DatabaseSchemaNameSchema = z.string().trim().min(1, {
  error: "Database schema name is required and must be a non-empty string.",
});

export const VersionInfoSchema = z.object({
  nodejs: z.string(),
  ponder: z.string(),
  ensRainbow: z.string(),
  ensRainbowSchema: PositiveIntegerSchema,
});

// type alias to highlight the input param of Zod's check() method
type ZodCheckFnInput<T> = z.core.ParsePayload<T>;

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
 * ENSIndexer Public Schema
 *
 * A configuration object which includes all important settings that
 * the ENSIndexer instance applies at its runtime.
 */
export const ENSIndexerPublicConfigSchema = z
  .object({
    ensAdminUrl: UrlSchema,
    ensNodePublicUrl: UrlSchema,
    ensRainbowEndpointUrl: UrlSchema,
    experimentalResolution: BooleanSchema,
    healReverseAddresses: BooleanSchema,
    indexAdditionalResolverRecords: BooleanSchema,
    indexedChainIds: IndexedChainIdsSchema,
    isSubgraphCompatible: BooleanSchema,
    namespace: ENSNamespaceSchema,
    plugins: PluginsSchema,
    databaseSchemaName: DatabaseSchemaNameSchema,
    port: PortSchema,
    versionInfo: VersionInfoSchema,
  })
  .check(invariant_reverseResolversPluginNeedsResolverRecords)
  .check(invariant_experimentalResolutionNeedsReverseResolversPlugin)
  .check(invariant_isSubgraphCompatibleRequirements);
