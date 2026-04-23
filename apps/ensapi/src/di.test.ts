import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ENSNamespaceIds, type EnsNodeStackInfo } from "@ensnode/ensnode-sdk";

// Only mock the absolute necessities - things that require external infrastructure
vi.mock("@ensnode/ensdb-sdk", async () => {
  const actual = await vi.importActual<typeof import("@ensnode/ensdb-sdk")>("@ensnode/ensdb-sdk");

  // Mock EnsDbReader as it requires a real database connection
  class MockEnsDbReader {
    ensDb = { drizzleInstance: "fake" };
    ensIndexerSchema = { name: "ensIndexerSchema" };
    ensIndexerSchemaName: string;

    constructor(
      public ensDbUrl: string,
      schemaName: string,
    ) {
      this.ensIndexerSchemaName = schemaName;
    }
  }

  return {
    ...actual,
    EnsDbReader: MockEnsDbReader,
  };
});

// Mock caches as they perform async operations
vi.mock("@/cache/indexing-status.cache", () => ({
  buildIndexingStatusCache: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue({ test: "indexingStatus" }),
  })),
}));

vi.mock("@/cache/referral-program-edition-set.cache", () => ({
  buildReferralProgramEditionConfigSetCache: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(new Map()),
  })),
}));

vi.mock("@/cache/stack-info.cache", () => ({
  buildEnsNodeStackInfoCache: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue({
      ensIndexer: { namespace: "ens" },
    }),
  })),
}));

vi.mock("@/lib/public-client", () => ({
  buildPublicClientForRootChain: vi.fn().mockReturnValue({
    request: vi.fn(),
  }),
}));

const VALID_ENSDB_URL = "postgresql://user:password@localhost:5432/mydb";
const VALID_ENSINDEXER_SCHEMA_NAME = "ensindexer_test";
const VALID_THEGRAPH_API_KEY = "test-api-key-12345";

describe("Dependency Injection Container (di)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("ENSDB_URL", VALID_ENSDB_URL);
    vi.stubEnv("ENSINDEXER_SCHEMA_NAME", VALID_ENSINDEXER_SCHEMA_NAME);
    vi.stubEnv("THEGRAPH_API_KEY", VALID_THEGRAPH_API_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("lazy initialization", () => {
    it("should lazily initialize ensApiConfig from environment on first access", async () => {
      const { default: di } = await import("@/di");

      const config = di.context.ensApiConfig;

      expect(config).toBeDefined();
      expect(config.ensDbUrl).toBe(VALID_ENSDB_URL);
      expect(config.ensIndexerSchemaName).toBe(VALID_ENSINDEXER_SCHEMA_NAME);
      expect(config.theGraphApiKey).toBe(VALID_THEGRAPH_API_KEY);
    });

    it("should cache ensApiConfig after first access", async () => {
      const { default: di } = await import("@/di");

      const config1 = di.context.ensApiConfig;
      const config2 = di.context.ensApiConfig;

      expect(config1).toBe(config2);
    });

    it("should lazily initialize ensDbConfig from environment on first access", async () => {
      const { default: di } = await import("@/di");

      const config = di.context.ensDbConfig;

      expect(config).toBeDefined();
      expect(config.ensDbUrl).toBe(VALID_ENSDB_URL);
      expect(config.ensIndexerSchemaName).toBe(VALID_ENSINDEXER_SCHEMA_NAME);
    });

    it("should cache ensDbConfig after first access", async () => {
      const { default: di } = await import("@/di");

      const config1 = di.context.ensDbConfig;
      const config2 = di.context.ensDbConfig;

      expect(config1).toBe(config2);
    });

    it("should lazily initialize ensDbClient using config values", async () => {
      const { default: di } = await import("@/di");

      const client = di.context.ensDbClient as unknown as Record<string, unknown>;

      expect(client).toBeDefined();
      expect(client.ensDbUrl).toBe(VALID_ENSDB_URL);
      expect(client.ensIndexerSchemaName).toBe(VALID_ENSINDEXER_SCHEMA_NAME);
    });

    it("should cache ensDbClient after first access", async () => {
      const { default: di } = await import("@/di");

      const client1 = di.context.ensDbClient;
      const client2 = di.context.ensDbClient;

      expect(client1).toBe(client2);
    });

    it("should provide ensDb as a convenience getter from ensDbClient", async () => {
      const { default: di } = await import("@/di");

      const ensDb = di.context.ensDb as unknown as Record<string, unknown>;

      expect(ensDb).toBeDefined();
      expect(ensDb.drizzleInstance).toBe("fake");
    });

    it("should provide ensIndexerSchema as a convenience getter from ensDbClient", async () => {
      const { default: di } = await import("@/di");

      const ensIndexerSchema = di.context.ensIndexerSchema as unknown as Record<string, unknown>;

      expect(ensIndexerSchema).toBeDefined();
      expect(ensIndexerSchema.name).toBe("ensIndexerSchema");
    });

    it("should lazily initialize indexingStatusCache on first access", async () => {
      const { buildIndexingStatusCache } = await import("@/cache/indexing-status.cache");
      const { default: di } = await import("@/di");

      const cache = di.context.indexingStatusCache;

      expect(buildIndexingStatusCache).toHaveBeenCalledTimes(1);
      expect(cache).toBeDefined();
    });

    it("should cache indexingStatusCache after first access", async () => {
      const { default: di } = await import("@/di");

      const cache1 = di.context.indexingStatusCache;
      const cache2 = di.context.indexingStatusCache;

      expect(cache1).toBe(cache2);
    });

    it("should lazily initialize referralProgramEditionConfigSetCache on first access", async () => {
      const { buildReferralProgramEditionConfigSetCache } = await import(
        "@/cache/referral-program-edition-set.cache"
      );
      const { default: di } = await import("@/di");

      const cache = di.context.referralProgramEditionConfigSetCache;

      expect(buildReferralProgramEditionConfigSetCache).toHaveBeenCalledTimes(1);
      expect(cache).toBeDefined();
    });

    it("should cache referralProgramEditionConfigSetCache after first access", async () => {
      const { default: di } = await import("@/di");

      const cache1 = di.context.referralProgramEditionConfigSetCache;
      const cache2 = di.context.referralProgramEditionConfigSetCache;

      expect(cache1).toBe(cache2);
    });

    it("should lazily initialize stackInfoCache on first access", async () => {
      const { buildEnsNodeStackInfoCache } = await import("@/cache/stack-info.cache");
      const { default: di } = await import("@/di");

      const cache = di.context.stackInfoCache;

      expect(buildEnsNodeStackInfoCache).toHaveBeenCalledTimes(1);
      expect(cache).toBeDefined();
    });

    it("should cache stackInfoCache after first access", async () => {
      const { default: di } = await import("@/di");

      const cache1 = di.context.stackInfoCache;
      const cache2 = di.context.stackInfoCache;

      expect(cache1).toBe(cache2);
    });

    it("should lazily initialize publicClientRootChain after stackInfo is set", async () => {
      const { buildPublicClientForRootChain } = await import("@/lib/public-client");
      const { default: di } = await import("@/di");

      // Must set stackInfo first so ensNamespace is available
      di.context.stackInfo = {
        ensIndexer: { namespace: "ens" },
      } as unknown as EnsNodeStackInfo;

      const client = di.context.publicClientRootChain;

      expect(buildPublicClientForRootChain).toHaveBeenCalledWith("ens");
      expect(client).toBeDefined();
    });

    it("should cache publicClientRootChain after first access", async () => {
      const { default: di } = await import("@/di");

      di.context.stackInfo = {
        ensIndexer: { namespace: "ens" },
      } as unknown as EnsNodeStackInfo;

      const client1 = di.context.publicClientRootChain;
      const client2 = di.context.publicClientRootChain;

      expect(client1).toBe(client2);
    });
  });

  describe("stackInfo getter/setter", () => {
    it("should throw error when stackInfo is accessed before being set", async () => {
      const { default: di } = await import("@/di");

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        di.context.stackInfo;
      }).toThrow("Invariant: EnsNodeStackInfo is not available in context.");
    });

    it("should return stackInfo after it has been set", async () => {
      const { default: di } = await import("@/di");

      const mockStackInfo = {
        ensIndexer: { namespace: "ens" },
      } as unknown as EnsNodeStackInfo;

      di.context.stackInfo = mockStackInfo;

      expect(di.context.stackInfo).toBe(mockStackInfo);
    });

    it("should only allow setting stackInfo once (subsequent sets are ignored)", async () => {
      const { default: di } = await import("@/di");

      const mockStackInfo1 = {
        ensIndexer: { namespace: "ens" },
      } as unknown as EnsNodeStackInfo;

      const mockStackInfo2 = {
        ensIndexer: { namespace: "basenames" },
      } as unknown as EnsNodeStackInfo;

      di.context.stackInfo = mockStackInfo1;
      di.context.stackInfo = mockStackInfo2;

      expect(di.context.stackInfo).toBe(mockStackInfo1);
      expect(di.context.stackInfo).not.toBe(mockStackInfo2);
    });

    it("should provide ensNamespace from stackInfo.ensIndexer.namespace", async () => {
      const { default: di } = await import("@/di");

      di.context.stackInfo = {
        ensIndexer: { namespace: "basenames" },
      } as unknown as EnsNodeStackInfo;

      expect(di.context.ensNamespace).toBe("basenames");
    });
  });

  describe("recreateContext", () => {
    it("should reset all cached instances when called", async () => {
      const { default: di, recreateContext } = await import("@/di");

      // Access properties to cache them
      const config1 = di.context.ensApiConfig;
      const client1 = di.context.ensDbClient;

      // Reset the context
      recreateContext();

      // Access again - should create new instances
      const config2 = di.context.ensApiConfig;
      const client2 = di.context.ensDbClient;

      // Different instances
      expect(config1).not.toBe(config2);
      expect(client1).not.toBe(client2);
    });

    it("should allow setting stackInfo on new context after recreate", async () => {
      const { default: di, recreateContext } = await import("@/di");

      // Set stackInfo on original context
      di.context.stackInfo = {
        ensIndexer: { namespace: "ens" },
      } as unknown as EnsNodeStackInfo;

      // Reset context
      recreateContext();

      // Should throw because stackInfo is not set on new context
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        di.context.stackInfo;
      }).toThrow("Invariant: EnsNodeStackInfo is not available in context.");

      // Can set it again on new context
      const newStackInfo = {
        ensIndexer: { namespace: "basenames" },
      } as unknown as EnsNodeStackInfo;

      di.context.stackInfo = newStackInfo;

      expect(di.context.stackInfo).toBe(newStackInfo);
    });
  });

  describe("integration", () => {
    it("should share the same context instance across multiple imports", async () => {
      const diModule1 = await import("@/di");
      const diModule2 = await import("@/di");

      expect(diModule1.default.context).toBe(diModule2.default.context);
    });

    it("should maintain separate state after recreateContext", async () => {
      const diModule1 = await import("@/di");

      // Set up stackInfo first
      diModule1.default.context.stackInfo = {
        ensIndexer: { namespace: ENSNamespaceIds.Mainnet },
      } as unknown as EnsNodeStackInfo;

      // Get references to old context and config
      const oldContext = diModule1.default.context;
      const oldConfig = diModule1.default.context.ensApiConfig;

      // Recreate context
      diModule1.recreateContext();

      // Set up stackInfo on new context
      diModule1.default.context.stackInfo = {
        ensIndexer: { namespace: ENSNamespaceIds.Sepolia },
      } as unknown as EnsNodeStackInfo;

      // Get references to new context and config
      const newContext = diModule1.default.context;
      const newConfig = diModule1.default.context.ensApiConfig;

      // Context objects and configs should be different
      expect(oldContext).not.toBe(newContext);
      expect(oldConfig).not.toBe(newConfig);

      // Verify new context has different namespace
      expect(diModule1.default.context.ensNamespace).toBe(ENSNamespaceIds.Sepolia);
    });
  });
});
