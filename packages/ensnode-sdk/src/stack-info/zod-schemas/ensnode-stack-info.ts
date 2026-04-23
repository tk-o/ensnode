import { z } from "zod/v4";

import {
  makeEnsApiPublicConfigSchema,
  makeSerializedEnsApiPublicConfigSchema,
} from "../../ensapi/config/zod-schemas";
import { makeEnsDbPublicConfigSchema } from "../../ensdb/zod-schemas/config";
import { validateSupportedLabelSetAndVersion } from "../../ensindexer/config/labelset-utils";
import {
  makeEnsIndexerPublicConfigSchema,
  makeSerializedEnsIndexerPublicConfigSchema,
} from "../../ensindexer/config/zod-schemas";
import type { EnsRainbowClientLabelSet, EnsRainbowServerLabelSet } from "../../ensrainbow/types";
import { makeEnsRainbowPublicConfigSchema } from "../../ensrainbow/zod-schemas/config";
import type { ZodCheckFnInput } from "../../shared/zod-types";
import type { EnsNodeStackInfo } from "../ensnode-stack-info";

export function invariant_ensRainbowSupportedLabelSetAndVersion(
  ctx: ZodCheckFnInput<EnsNodeStackInfo>,
) {
  const clientLabelSet = ctx.value.ensIndexer.labelSet satisfies EnsRainbowClientLabelSet;
  const serverLabelSet = ctx.value.ensRainbow.labelSet satisfies EnsRainbowServerLabelSet;

  try {
    validateSupportedLabelSetAndVersion(serverLabelSet, clientLabelSet);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    ctx.issues.push({
      code: "custom",
      input: ctx.value,
      message: `The ENSRainbow label set and version specified in the config are not supported by the ENSRainbow version specified in ensRainbowPublicConfig. Cause: ${errorMessage}`,
    });
  }
}

export function makeSerializedEnsNodeStackInfoSchema(valueLabel?: string) {
  const label = valueLabel ?? "ENSNodeStackInfo";

  return z.object({
    ensApi: makeSerializedEnsApiPublicConfigSchema(`${label}.ensApi`),
    ensDb: makeEnsDbPublicConfigSchema(`${label}.ensDb`),
    ensIndexer: makeSerializedEnsIndexerPublicConfigSchema(`${label}.ensIndexer`),
    ensRainbow: makeEnsRainbowPublicConfigSchema(`${label}.ensRainbow`),
  });
}

export function makeEnsNodeStackInfoSchema(valueLabel?: string) {
  const label = valueLabel ?? "ENSNodeStackInfo";

  return z
    .object({
      ensApi: makeEnsApiPublicConfigSchema(`${label}.ensApi`),
      ensDb: makeEnsDbPublicConfigSchema(`${label}.ensDb`),
      ensIndexer: makeEnsIndexerPublicConfigSchema(`${label}.ensIndexer`),
      ensRainbow: makeEnsRainbowPublicConfigSchema(`${label}.ensRainbow`),
    })
    .check(invariant_ensRainbowSupportedLabelSetAndVersion);
}
