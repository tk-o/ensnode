import { redactString, redactUrl } from "@ensnode/ensnode-sdk/internal";

import type { EnsApiConfig } from "@/config/config.schema";

/**
 * Redact sensitive values from ENSApi configuration.
 */
export function redactEnsApiConfig(config: EnsApiConfig) {
  return {
    port: config.port,
    referralProgramEditionConfigSetUrl: config.referralProgramEditionConfigSetUrl
      ? redactUrl(config.referralProgramEditionConfigSetUrl)
      : undefined,
    ensDbUrl: redactString(config.ensDbUrl),
    ensIndexerSchemaName: config.ensIndexerSchemaName,
    theGraphApiKey: config.theGraphApiKey ? redactString(config.theGraphApiKey) : undefined,
  };
}
