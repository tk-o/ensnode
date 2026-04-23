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

// Invariant: ENSIndexerPublicConfig VersionInfo must match ENSApi
export function invariant_ensIndexerPublicConfigVersionInfo(
  ctx: ZodCheckFnInput<EnsNodeStackInfo>,
) {
  const {
    value: { ensIndexer, ensApi, ensRainbow },
  } = ctx;

  // Invariant: ENSApi & ENSDB must match version numbers
  if (ensIndexer.versionInfo.ensDb !== ensApi.versionInfo.ensApi) {
    ctx.issues.push({
      code: "custom",
      path: ["ensIndexer.versionInfo.ensDb"],
      input: ensIndexer.versionInfo.ensDb,
      message: `Version Mismatch: ENSDB@${ensIndexer.versionInfo.ensDb} !== ENSApi@${ensApi.versionInfo.ensApi}`,
    });
  }

  // Invariant: ENSApi & ENSIndexer must match version numbers
  if (ensIndexer.versionInfo.ensIndexer !== ensApi.versionInfo.ensApi) {
    ctx.issues.push({
      code: "custom",
      path: ["ensIndexer.versionInfo.ensIndexer"],
      input: ensIndexer.versionInfo.ensIndexer,
      message: `Version Mismatch: ENSIndexer@${ensIndexer.versionInfo.ensIndexer} !== ENSApi@${ensApi.versionInfo.ensApi}`,
    });
  }

  // Invariant: ENSApi & ENSRainbow must match version numbers
  if (ensRainbow.versionInfo.ensRainbow !== ensApi.versionInfo.ensApi) {
    ctx.issues.push({
      code: "custom",
      path: ["ensRainbow.versionInfo.ensRainbow"],
      input: ensRainbow.versionInfo.ensRainbow,
      message: `Version Mismatch: ENSRainbow@${ensRainbow.versionInfo.ensRainbow} !== ENSApi@${ensApi.versionInfo.ensApi}`,
    });
  }

  // Invariant: `@adraffy/ens-normalize` package version must match between ENSApi & ENSIndexer
  if (ensIndexer.versionInfo.ensNormalize !== ensApi.versionInfo.ensNormalize) {
    ctx.issues.push({
      code: "custom",
      path: ["ensIndexer.versionInfo.ensNormalize"],
      input: ensIndexer.versionInfo.ensNormalize,
      message: `Dependency Version Mismatch: '@adraffy/ens-normalize' version must be the same between ENSIndexer and ENSApi. Found ENSApi@${ensApi.versionInfo.ensNormalize} and ENSIndexer@${ensIndexer.versionInfo.ensNormalize}`,
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
