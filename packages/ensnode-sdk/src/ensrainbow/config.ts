import type { EnsRainbowServerLabelSet } from "./types";

/**
 * Version info about ENSRainbow and its dependencies.
 */
interface EnsRainbowVersionInfo {
  /**
   * ENSRainbow service version
   *
   * @see https://ghcr.io/namehash/ensnode/ensrainbow
   */
  ensRainbow: string;
}

/**
 * Complete public configuration object for ENSRainbow.
 *
 * Contains all public configuration information about the ENSRainbow service instance,
 * including version, label set information, and record counts.
 */
export interface EnsRainbowPublicConfig {
  /**
   * The label set reference managed by the ENSRainbow server.
   */
  labelSet: EnsRainbowServerLabelSet;

  /**
   * Version info about ENSRainbow.
   */
  versionInfo: EnsRainbowVersionInfo;
}
