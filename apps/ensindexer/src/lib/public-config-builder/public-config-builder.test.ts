import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ENSNamespaceIds,
  type EnsIndexerPublicConfig,
  type EnsIndexerVersionInfo,
  PluginName,
} from "@ensnode/ensnode-sdk";
import type { EnsRainbow } from "@ensnode/ensrainbow-sdk";

import { PublicConfigBuilder } from "./public-config-builder";

// Mock the config module
vi.mock("@/config", () => ({
  default: {
    ensIndexerSchemaName: "ensindexer_0",
    labelSet: { labelSetId: "subgraph", labelSetVersion: 0 },
    indexedChainIds: new Set([1, 8453]),
    isSubgraphCompatible: true,
    namespace: ENSNamespaceIds.Mainnet,
    plugins: [PluginName.Subgraph],
  },
}));

// Mock the version-info module
vi.mock("@/lib/version-info", () => ({
  getEnsIndexerVersion: vi.fn(),
  getPackageVersion: vi.fn(),
}));

// Mock the SDK validation functions
vi.mock("@ensnode/ensnode-sdk", async () => {
  const actual =
    await vi.importActual<typeof import("@ensnode/ensnode-sdk")>("@ensnode/ensnode-sdk");
  return {
    ...actual,
    validateEnsIndexerPublicConfig: vi.fn(),
    validateEnsIndexerVersionInfo: vi.fn(),
  };
});

import config from "@/config";

import {
  validateEnsIndexerPublicConfig,
  validateEnsIndexerVersionInfo,
} from "@ensnode/ensnode-sdk";

import { getEnsIndexerVersion, getPackageVersion } from "@/lib/version-info";

// Test fixtures
const mockVersionInfo: EnsIndexerVersionInfo = {
  ponder: "0.9.0",
  ensDb: "1.0.0",
  ensIndexer: "1.0.0",
  ensNormalize: "1.10.0",
};

// Helper to create unique mock config objects for each call
function createMockPublicConfig(overrides: Partial<EnsIndexerPublicConfig> = {}) {
  return {
    ensIndexerSchemaName: "ensindexer_0",
    labelSet: { labelSetId: "subgraph", labelSetVersion: 0 },
    indexedChainIds: new Set([1, 8453]),
    isSubgraphCompatible: true,
    namespace: ENSNamespaceIds.Mainnet,
    plugins: ["subgraph"],
    versionInfo: mockVersionInfo,
    ...overrides,
  } as EnsIndexerPublicConfig;
}

// Helper to setup standard mocks
function setupStandardMocks() {
  vi.mocked(getEnsIndexerVersion).mockReturnValue("1.0.0");
  vi.mocked(getPackageVersion).mockReturnValue("0.9.0");
  vi.mocked(validateEnsIndexerVersionInfo).mockReturnValue(mockVersionInfo);
}

describe("PublicConfigBuilder", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getPublicConfig() - successful builds", () => {
    it("builds and returns public config on first call", async () => {
      // Arrange
      setupStandardMocks();
      const mockPublicConfig = createMockPublicConfig();
      vi.mocked(validateEnsIndexerPublicConfig).mockReturnValue(mockPublicConfig);

      const builder = new PublicConfigBuilder();

      // Act
      const result = builder.getEnsIndexerPublicConfig();

      // Assert
      expect(getEnsIndexerVersion).toHaveBeenCalledTimes(1);
      expect(getPackageVersion).toHaveBeenCalledWith("ponder");
      expect(getPackageVersion).toHaveBeenCalledWith("@adraffy/ens-normalize");

      expect(validateEnsIndexerVersionInfo).toHaveBeenCalledWith({
        ponder: "0.9.0",
        ensDb: "1.0.0",
        ensIndexer: "1.0.0",
        ensNormalize: "0.9.0",
      });

      expect(validateEnsIndexerPublicConfig).toHaveBeenCalledWith({
        ensIndexerSchemaName: config.ensIndexerSchemaName,
        labelSet: config.labelSet,
        indexedChainIds: config.indexedChainIds,
        isSubgraphCompatible: config.isSubgraphCompatible,
        namespace: config.namespace,
        plugins: config.plugins,
        versionInfo: mockVersionInfo,
      });

      expect(result).toBe(mockPublicConfig);
    });

    it("caches public config and returns cached version on subsequent calls", async () => {
      // Arrange
      setupStandardMocks();
      const mockPublicConfig = createMockPublicConfig();
      vi.mocked(validateEnsIndexerPublicConfig).mockReturnValue(mockPublicConfig);

      const builder = new PublicConfigBuilder();

      // Act
      const result1 = builder.getEnsIndexerPublicConfig();
      const result2 = builder.getEnsIndexerPublicConfig();
      const result3 = builder.getEnsIndexerPublicConfig();

      // Assert
      expect(getEnsIndexerVersion).toHaveBeenCalledTimes(1);
      expect(getPackageVersion).toHaveBeenCalledTimes(2);
      expect(validateEnsIndexerVersionInfo).toHaveBeenCalledTimes(1);
      expect(validateEnsIndexerPublicConfig).toHaveBeenCalledTimes(1);

      // All results should be the same cached object
      expect(result1).toBe(mockPublicConfig);
      expect(result2).toBe(mockPublicConfig);
      expect(result3).toBe(mockPublicConfig);
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it("handles different plugin configurations", async () => {
      // Arrange
      const customConfig = createMockPublicConfig({
        plugins: ["basenames", "lineanames", "subgraph"],
        indexedChainIds: new Set([1, 8453, 59144]),
      });

      vi.mocked(getEnsIndexerVersion).mockReturnValue("2.0.0");
      vi.mocked(getPackageVersion).mockReturnValue("1.0.0");

      const customVersionInfo: EnsIndexerVersionInfo = {
        ponder: "1.0.0",
        ensDb: "2.0.0",
        ensIndexer: "2.0.0",
        ensNormalize: "1.10.0",
      };

      vi.mocked(validateEnsIndexerVersionInfo).mockReturnValue(customVersionInfo);
      vi.mocked(validateEnsIndexerPublicConfig).mockReturnValue(customConfig);

      const builder = new PublicConfigBuilder();

      // Act
      const result = builder.getEnsIndexerPublicConfig();

      // Assert
      expect(result).toBe(customConfig);
      expect(result.plugins).toHaveLength(3);
    });

    it("handles non-subgraph-compatible mode", async () => {
      // Arrange
      const customConfig = createMockPublicConfig({
        isSubgraphCompatible: false,
        labelSet: { labelSetId: "custom", labelSetVersion: 1 },
      });

      setupStandardMocks();
      vi.mocked(validateEnsIndexerPublicConfig).mockReturnValue(customConfig);

      const builder = new PublicConfigBuilder();

      // Act
      const result = builder.getEnsIndexerPublicConfig();

      // Assert
      expect(result).toBe(customConfig);
      expect(result.isSubgraphCompatible).toBe(false);
    });
  });

  describe("getPublicConfig() - error handling", () => {
    it("throws when ENSRainbow client config() fails", async () => {
      // Arrange
      const ensRainbowError = new Error("ENSRainbow service unavailable");
      const ensRainbowClientMock = {
        config: vi.fn().mockRejectedValue(ensRainbowError),
      } as unknown as EnsRainbow.ApiClient;

      setupStandardMocks();

      const builder = new PublicConfigBuilder();

      // Act & Assert
      expect(() => builder.getEnsIndexerPublicConfig()).toThrow(ensRainbowError);
      expect(ensRainbowClientMock.config).toHaveBeenCalledTimes(1);
      expect(validateEnsIndexerPublicConfig).not.toHaveBeenCalled();
    });

    it("throws when version info validation fails", async () => {
      // Arrange;

      setupStandardMocks();

      const validationError = new Error("Invalid version info: missing required fields");
      vi.mocked(validateEnsIndexerVersionInfo).mockImplementation(() => {
        throw validationError;
      });

      const builder = new PublicConfigBuilder();

      // Act & Assert
      await expect(builder.getEnsIndexerPublicConfig()).rejects.toThrow(validationError);
      expect(validateEnsIndexerVersionInfo).toHaveBeenCalledTimes(1);
      expect(validateEnsIndexerPublicConfig).not.toHaveBeenCalled();
    });

    it("throws when public config validation fails", async () => {
      // Arrange
      setupStandardMocks();

      const validationError = new Error("Invalid public config: invalid namespace");
      vi.mocked(validateEnsIndexerPublicConfig).mockImplementation(() => {
        throw validationError;
      });

      const builder = new PublicConfigBuilder();

      // Act & Assert
      expect(() => builder.getEnsIndexerPublicConfig()).toThrow(validationError);
      expect(validateEnsIndexerPublicConfig).toHaveBeenCalledTimes(1);
    });
  });
});
