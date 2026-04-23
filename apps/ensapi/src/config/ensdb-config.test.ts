import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
  },
  makeLogger: vi.fn().mockReturnValue({
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

const VALID_ENSDB_URL = "postgresql://user:password@localhost:5432/mydb";
const VALID_ENSINDEXER_SCHEMA_NAME = "ensindexer_test";

describe("ensdb singleton bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("ENSDB_URL", VALID_ENSDB_URL);
    vi.stubEnv("ENSINDEXER_SCHEMA_NAME", VALID_ENSINDEXER_SCHEMA_NAME);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("constructs EnsDbReader from real env wiring without errors", async () => {
    const { ensDbClient, ensDb, ensIndexerSchema } = await import("@/di").then(
      (mod) => mod.default.context,
    );

    // ensDbClient is a lazyProxy — construction is deferred until first property access.
    // Accessing a property triggers EnsDbReader construction; verify it succeeds.
    expect(ensDbClient.ensIndexerSchemaName).toBe(VALID_ENSINDEXER_SCHEMA_NAME);
    expect(ensDb).toBeDefined();
    expect(ensIndexerSchema).toBeDefined();
  }, 10_000);

  it("exits when ENSDB_URL is missing", async () => {
    const { default: logger } = await import("@/lib/logger");

    vi.stubEnv("ENSDB_URL", "");

    // Stub process.exit specifically rather than replacing the entire process object.
    // This ensures the module's reference to process (captured at load time) still
    // points to the same object, but exit now calls our mock.
    let exitCalled = false;
    let exitCode: number | undefined;
    const originalExit = process.exit;
    process.exit = ((code?: number) => {
      exitCalled = true;
      exitCode = code;
      throw new Error("process.exit");
    }) as typeof process.exit;

    // ensDbClient is a lazyProxy — import succeeds but first property access triggers construction,
    // which calls buildEnsDbConfigFromEnvironment and exits on invalid config.
    const context = await import("@/di").then((mod) => mod.default.context);

    // Try/catch instead of expect(...).toThrow() because the error was escaping
    // Note: Do not destructure ensDbClient outside the try-catch, as destructuring
    // triggers the getter immediately, causing the error to escape.
    let caughtError: Error | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      context.ensDbClient.ensDb;
    } catch (error) {
      caughtError = error as Error;
    } finally {
      // Restore original exit to avoid affecting other tests
      process.exit = originalExit;
    }

    expect(caughtError).toBeDefined();
    expect(caughtError?.message).toBe("process.exit");
    expect(exitCalled).toBe(true);
    expect(exitCode).toBe(1);
    expect(logger.error).toHaveBeenCalled();
  });

  it("exits when ENSINDEXER_SCHEMA_NAME is missing", async () => {
    const { default: logger } = await import("@/lib/logger");

    vi.stubEnv("ENSINDEXER_SCHEMA_NAME", "");

    // Stub process.exit specifically rather than replacing the entire process object.
    // This ensures the module's reference to process (captured at load time) still
    // points to the same object, but exit now calls our mock.
    let exitCalled = false;
    let exitCode: number | undefined;
    const originalExit = process.exit;
    process.exit = ((code?: number) => {
      exitCalled = true;
      exitCode = code;
      throw new Error("process.exit");
    }) as typeof process.exit;

    // ensDbClient is a lazyProxy — import succeeds but first property access triggers construction,
    // which calls buildEnsDbConfigFromEnvironment and exits on invalid config.
    const context = await import("@/di").then((mod) => mod.default.context);

    // Try/catch instead of expect(...).toThrow() because the error was escaping
    // Note: Do not destructure ensDbClient outside the try-catch, as destructuring
    // triggers the getter immediately, causing the error to escape.
    let caughtError: Error | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      context.ensDbClient.ensDb;
    } catch (error) {
      caughtError = error as Error;
    } finally {
      // Restore original exit to avoid affecting other tests
      process.exit = originalExit;
    }

    expect(caughtError).toBeDefined();
    expect(caughtError?.message).toBe("process.exit");
    expect(exitCalled).toBe(true);
    expect(exitCode).toBe(1);
    expect(logger.error).toHaveBeenCalled();
  });
});
