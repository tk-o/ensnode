import type { Context, EventNames } from "ponder:registry";
import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import "@/lib/__test__/mockLogger";

import { setupConfigMock, setupEnsDbConfigMock } from "@/lib/__test__/mockConfig";

setupConfigMock();
setupEnsDbConfigMock();

import type { IndexingEngineContext, IndexingEngineEvent } from "./ponder";

const { mockPonderOn } = vi.hoisted(() => ({ mockPonderOn: vi.fn() }));

const { mockInitIndexingOnchainEvents } = vi.hoisted(() => ({
  mockInitIndexingOnchainEvents: vi.fn(),
}));

// Set up PONDER_COMMON global before any imports that depend on it
vi.hoisted(() => {
  (globalThis as any).PONDER_COMMON = {
    options: {
      command: "start",
      port: 42069,
    },
    logger: {
      trace: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock("ponder:registry", () => ({
  ponder: {
    on: (...args: unknown[]) => mockPonderOn(...args),
  },
}));

vi.mock("ponder:schema", () => ({
  ensIndexerSchema: {},
}));

vi.mock("./init-indexing-onchain-events", () => ({
  initIndexingOnchainEvents: mockInitIndexingOnchainEvents,
}));

describe("ponderAdapter", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockInitIndexingOnchainEvents.mockResolvedValue(undefined);
    // Reset module state to test idempotent behavior correctly
    vi.resetModules();
  });

  // Helper to get fresh module reference after resetModules()
  async function getPonderModule() {
    return await import("./ponder");
  }

  // Helper to extract the callback registered with ponder.on
  function getRegisteredCallback(
    callIndex = 0,
  ): (args: {
    context: Context<EventNames>;
    event: IndexingEngineEvent<EventNames>;
  }) => Promise<void> {
    return mockPonderOn.mock.calls[callIndex]![1] as ReturnType<typeof getRegisteredCallback>;
  }

  describe("handler registration", () => {
    it("registers the event name and handler with ponder.on", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler = vi.fn();

      ponderAdapter.on("Resolver:AddrChanged", handler);

      expect(mockPonderOn).toHaveBeenCalledWith("Resolver:AddrChanged", expect.any(Function));
    });

    it("returns the subscription object from ponder.on", async () => {
      const { ponderAdapter } = await getPonderModule();
      const mockSubscription = { unsubscribe: vi.fn() };
      mockPonderOn.mockReturnValue(mockSubscription);
      const handler = vi.fn();

      const result = ponderAdapter.on("Resolver:AddrChanged", handler);

      expect(result).toBe(mockSubscription);
    });
  });

  describe("context transformation", () => {
    it("exposes ensDb as an alias to the Ponder db", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler = vi.fn();
      const mockDb = vi.fn();
      const mockContext = {
        db: mockDb,
        chain: { id: 1 },
        contracts: {},
      } as unknown as Context<EventNames>;

      ponderAdapter.on("Resolver:AddrChanged", handler);
      await getRegisteredCallback()({
        context: mockContext,
        event: {} as IndexingEngineEvent<EventNames>,
      });

      const receivedContext = handler.mock.calls[0]![0].context;
      expect(receivedContext.ensDb).toBe(mockDb);
    });

    it("maps Ponder chain id to engine-agnostic chain id", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler = vi.fn().mockResolvedValue(undefined);
      const mockDb = vi.fn();
      const mockContext = {
        db: mockDb,
        chain: { id: 1 },
        client: { request: vi.fn() },
        contracts: {},
      } as unknown as Context<EventNames>;
      const mockEvent = { args: { node: "0x123" } } as unknown as IndexingEngineEvent<EventNames>;

      ponderAdapter.on("Resolver:AddrChanged", handler);
      await getRegisteredCallback()({ context: mockContext, event: mockEvent });

      expect(handler).toHaveBeenCalledWith({
        context: expect.objectContaining({
          chain: { id: 1 },
          client: expect.any(Object),
          ensDb: mockDb,
          namespace: expect.any(String),
          isSubgraphCompatible: expect.any(Boolean),
        }),
        event: mockEvent,
      });
    });
  });

  describe("event forwarding", () => {
    it("passes the original event to the handler unchanged", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler = vi.fn().mockResolvedValue(undefined);
      const mockDb = vi.fn();
      const mockEvent = {
        args: { node: "0x123", label: "0x456", owner: "0x789" },
        block: { number: 100n },
        transaction: { hash: "0xabc" },
      } as unknown as IndexingEngineEvent<EventNames>;

      ponderAdapter.on("Registry:Transfer", handler);
      await getRegisteredCallback()({
        context: { db: mockDb, chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: mockEvent,
      });

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ event: mockEvent }));
    });

    it("supports multiple independent event registrations", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler1 = vi.fn().mockResolvedValue(undefined);
      const handler2 = vi.fn().mockResolvedValue(undefined);

      ponderAdapter.on("Resolver:AddrChanged", handler1);
      ponderAdapter.on("Resolver:NameChanged", handler2);

      expect(mockPonderOn).toHaveBeenCalledTimes(2);

      // Trigger first handler
      await getRegisteredCallback(0)({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: {} as IndexingEngineEvent<EventNames>,
      });
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();

      // Trigger second handler
      await getRegisteredCallback(1)({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: {} as IndexingEngineEvent<EventNames>,
      });
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe("handler types", () => {
    it("supports async handlers", async () => {
      const { ponderAdapter } = await getPonderModule();
      const asyncHandler = vi.fn().mockResolvedValue(undefined);

      ponderAdapter.on("Resolver:AddrChanged", asyncHandler);
      await getRegisteredCallback()({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: {} as IndexingEngineEvent<EventNames>,
      });

      expect(asyncHandler).toHaveBeenCalled();
    });

    it("supports sync handlers", async () => {
      const { ponderAdapter } = await getPonderModule();
      const syncHandler = vi.fn();

      ponderAdapter.on("Resolver:AddrChanged", syncHandler);
      await getRegisteredCallback()({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: {} as IndexingEngineEvent<EventNames>,
      });

      expect(syncHandler).toHaveBeenCalled();
    });
  });

  describe("error propagation", () => {
    it("re-throws errors from sync handlers", async () => {
      const { ponderAdapter } = await getPonderModule();
      const error = new Error("Sync handler failed");
      const failingHandler = vi.fn(() => {
        throw error;
      });

      ponderAdapter.on("Resolver:AddrChanged", failingHandler);

      await expect(
        getRegisteredCallback()({
          context: {
            db: vi.fn(),
            chain: { id: 1 },
            contracts: {},
          } as unknown as Context<EventNames>,
          event: {} as IndexingEngineEvent<EventNames>,
        }),
      ).rejects.toThrow("Sync handler failed");
    });

    it("re-throws errors from async handlers", async () => {
      const { ponderAdapter } = await getPonderModule();
      const error = new Error("Async handler failed");
      const failingHandler = vi.fn().mockRejectedValue(error);

      ponderAdapter.on("Resolver:AddrChanged", failingHandler);

      await expect(
        getRegisteredCallback()({
          context: {
            db: vi.fn(),
            chain: { id: 1 },
            contracts: {},
          } as unknown as Context<EventNames>,
          event: {} as IndexingEngineEvent<EventNames>,
        }),
      ).rejects.toThrow("Async handler failed");
    });
  });

  describe("onchain event preconditions", () => {
    it("runs onchain event initialization before executing the handler", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler = vi.fn().mockResolvedValue(undefined);

      ponderAdapter.on("Resolver:AddrChanged", handler);
      await getRegisteredCallback()({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: {} as IndexingEngineEvent<EventNames>,
      });

      expect(mockInitIndexingOnchainEvents).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalled();
    });

    it("prevents handler execution if onchain event initialization fails", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler = vi.fn().mockResolvedValue(undefined);
      mockInitIndexingOnchainEvents.mockRejectedValue(
        new Error("Onchain event initialization failed"),
      );

      ponderAdapter.on("Resolver:AddrChanged", handler);

      await expect(
        getRegisteredCallback()({
          context: {
            db: vi.fn(),
            chain: { id: 1 },
            contracts: {},
          } as unknown as Context<EventNames>,
          event: {} as IndexingEngineEvent<EventNames>,
        }),
      ).rejects.toThrow("Onchain event initialization failed");

      expect(handler).not.toHaveBeenCalled();
    });

    it("calls initIndexingOnchainEvents only once across multiple onchain events (idempotent)", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler1 = vi.fn().mockResolvedValue(undefined);
      const handler2 = vi.fn().mockResolvedValue(undefined);

      // Register two different onchain event listeners
      ponderAdapter.on("Resolver:AddrChanged", handler1);
      ponderAdapter.on("Registry:Transfer", handler2);

      // Trigger the first event handler
      await getRegisteredCallback(0)({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: { args: { a: "1" } } as unknown as IndexingEngineEvent<EventNames>,
      });
      expect(mockInitIndexingOnchainEvents).toHaveBeenCalledTimes(1);

      // Trigger the second event handler
      await getRegisteredCallback(1)({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: { args: { a: "2" } } as unknown as IndexingEngineEvent<EventNames>,
      });

      // Should still only have been called once (idempotent behavior)
      expect(mockInitIndexingOnchainEvents).toHaveBeenCalledTimes(1);
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("calls initIndexingOnchainEvents only once when two onchain callbacks fire concurrently before the initialization promise resolves", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler1 = vi.fn().mockResolvedValue(undefined);
      const handler2 = vi.fn().mockResolvedValue(undefined);
      let resolveReadiness: (() => void) | undefined;

      // Create a promise that won't resolve until we manually trigger it
      mockInitIndexingOnchainEvents.mockImplementation(() => {
        return new Promise<void>((resolve) => {
          resolveReadiness = resolve;
        });
      });

      // Register two different onchain event listeners
      ponderAdapter.on("Resolver:AddrChanged", handler1);
      ponderAdapter.on("Registry:Transfer", handler2);

      // Fire both handlers concurrently - neither should complete yet
      const promise1 = getRegisteredCallback(0)({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: { args: { a: "1" } } as unknown as IndexingEngineEvent<EventNames>,
      });
      const promise2 = getRegisteredCallback(1)({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: { args: { a: "2" } } as unknown as IndexingEngineEvent<EventNames>,
      });

      // Allow the dynamic import to settle before asserting
      await vi.waitFor(() => expect(mockInitIndexingOnchainEvents).toHaveBeenCalledTimes(1));

      // Neither handler should have executed yet
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();

      // Now resolve the readiness promise
      resolveReadiness!();

      // Wait for both handlers to complete
      await Promise.all([promise1, promise2]);

      // Both handlers should have executed after resolution
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("resolves onchain event initialization before calling the handler", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler = vi.fn().mockResolvedValue(undefined);
      let preconditionResolved = false;

      mockInitIndexingOnchainEvents.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        preconditionResolved = true;
      });

      ponderAdapter.on("Resolver:AddrChanged", handler);
      await getRegisteredCallback()({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: {} as IndexingEngineEvent<EventNames>,
      });

      expect(preconditionResolved).toBe(true);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("setup events (no preconditions)", () => {
    it("skips onchain event initialization for :setup events", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler = vi.fn().mockResolvedValue(undefined);

      ponderAdapter.on("Registry:setup", handler);
      await getRegisteredCallback()({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: {} as IndexingEngineEvent<EventNames>,
      });

      expect(mockInitIndexingOnchainEvents).not.toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });

    it("handles various setup event name formats", async () => {
      const { ponderAdapter } = await getPonderModule();
      const handler = vi.fn().mockResolvedValue(undefined);
      const setupEvents = [
        "Registry:setup",
        "PublicResolver:setup",
        "ETHRegistrarController:setup",
      ];

      for (const eventName of setupEvents) {
        vi.clearAllMocks();
        handler.mockClear();

        ponderAdapter.on(eventName, handler);
        await getRegisteredCallback()({
          context: {
            db: vi.fn(),
            chain: { id: 1 },
            contracts: {},
          } as unknown as Context<EventNames>,
          event: {} as IndexingEngineEvent<EventNames>,
        });

        expect(mockInitIndexingOnchainEvents).not.toHaveBeenCalled();
        expect(handler).toHaveBeenCalled();
      }
    });
  });

  describe("event type detection", () => {
    it("treats :setup suffix as setup event type", async () => {
      const { ponderAdapter } = await getPonderModule();
      const setupHandler = vi.fn().mockResolvedValue(undefined);
      const onchainHandler = vi.fn().mockResolvedValue(undefined);

      ponderAdapter.on("PublicResolver:setup", setupHandler);
      ponderAdapter.on("PublicResolver:AddrChanged", onchainHandler);

      // Setup event - no onchain event initialization
      await getRegisteredCallback(0)({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: {} as IndexingEngineEvent<EventNames>,
      });
      expect(mockInitIndexingOnchainEvents).not.toHaveBeenCalled();
      expect(setupHandler).toHaveBeenCalled();

      // Onchain event - initialization required
      await getRegisteredCallback(1)({
        context: { db: vi.fn(), chain: { id: 1 }, contracts: {} } as unknown as Context<EventNames>,
        event: {} as IndexingEngineEvent<EventNames>,
      });
      expect(mockInitIndexingOnchainEvents).toHaveBeenCalledTimes(1);
      expect(onchainHandler).toHaveBeenCalled();
    });

    it("treats all non-:setup events as onchain events", async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const onchainEvents = [
        "Resolver:AddrChanged",
        "Registry:Transfer",
        "ETHRegistry:NewResolver",
        "BaseRegistrar:NameRegistered",
      ];

      for (const eventName of onchainEvents) {
        vi.clearAllMocks();
        vi.resetModules();
        const { ponderAdapter: freshAdapter } = await getPonderModule();
        handler.mockClear();

        freshAdapter.on(eventName, handler);
        await getRegisteredCallback()({
          context: {
            db: vi.fn(),
            chain: { id: 1 },
            contracts: {},
          } as unknown as Context<EventNames>,
          event: {} as IndexingEngineEvent<EventNames>,
        });

        expect(mockInitIndexingOnchainEvents).toHaveBeenCalled();
        expect(handler).toHaveBeenCalled();
      }
    });
  });
});

describe("IndexingEngineContext type", () => {
  it("exposes ensDb", () => {
    expectTypeOf<IndexingEngineContext["ensDb"]>().toBeObject();
  });
});
