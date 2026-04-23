import packageJson from "@/../package.json" with { type: "json" };

import type { EnsRainbow } from "@ensnode/ensrainbow-sdk";

import type { DbConfig } from "./types";

export function buildEnsRainbowPublicConfig(dbConfig: DbConfig): EnsRainbow.ENSRainbowPublicConfig {
  return {
    labelSet: dbConfig.labelSet,
    versionInfo: {
      ensRainbow: packageJson.version,
    },
  };
}
