/**
 * Ponder Indexing Engine Adapter
 *
 * This module adapts Ponder's indexing runtime to the engine-agnostic
 * {@link IndexingEngineAdapter} interface defined by `@ensnode/ensdb-writer`.
 * It builds an engine-agnostic {@link IndexingEngineContext} from Ponder's
 * handler context and wraps `ponder.on` so the shared handlers in
 * `@ensnode/ensdb-writer` can run unchanged.
 *
 * For more details on Ponder, see the Ponder documentation.
 * @see https://ponder.sh/docs/indexing/overview
 */

export * as ensIndexerSchema from "ponder:schema";

export type {
  IndexingEngineContext,
  IndexingEngineEvent,
} from "@ensnode/ensdb-writer";

import config from "@/config";

import { type EventNames, type Context as PonderIndexingContext, ponder } from "ponder:registry";

import type {
  IndexingEngineAdapter,
  IndexingEngineContext,
  IndexingEngineEvent,
} from "@ensnode/ensdb-writer";
import type { PonderAppLog } from "@ensnode/ponder-sdk";

import { ensRainbowClient } from "@/lib/ensrainbow/singleton";
import { logger } from "@/lib/logger";

/**
 * Map a Ponder handler context to the engine-agnostic context used by
 * `@ensnode/ensdb-writer` handlers.
 */
function buildIndexingEngineContext(
  ponderContext: PonderIndexingContext<EventNames>,
): IndexingEngineContext {
  return {
    chain: {
      id: ponderContext.chain.id,
    },
    client: ponderContext.client as IndexingEngineContext["client"],
    contracts: ponderContext.contracts as IndexingEngineContext["contracts"],
    ensDb: ponderContext.db as unknown as IndexingEngineContext["ensDb"],
    ensRainbow: ensRainbowClient,
    logger: {
      info: (message) => logger.info(message as unknown as PonderAppLog),
      warn: (message) => logger.warn(message as unknown as PonderAppLog),
      error: (message) => logger.error(message as unknown as PonderAppLog),
      debug: (message) => logger.debug(message as unknown as PonderAppLog),
    },
    namespace: config.namespace,
    isSubgraphCompatible: config.isSubgraphCompatible,
  };
}

/**
 * Event type IDs for indexing handlers.
 */
const EventTypeIds = {
  /**
   * Setup event
   *
   * Driven by indexing initialization code, not by indexing an onchain event.
   */
  Setup: "Setup",

  /**
   * Onchain event
   *
   * Driven by an onchain event emitted by an indexed contract.
   */
  OnchainEvent: "OnchainEvent",
} as const;

/**
 * The derived string union of possible {@link EventTypeIds}.
 */
type EventTypeId = (typeof EventTypeIds)[keyof typeof EventTypeIds];

function buildEventTypeId(eventName: string): EventTypeId {
  if (eventName.endsWith(":setup")) {
    return EventTypeIds.Setup;
  } else {
    return EventTypeIds.OnchainEvent;
  }
}

let initIndexingOnchainEventsPromise: Promise<void> | null = null;

// Cumulative events-per-second tracking across the process lifetime. Logged at most
// once per minute. Overhead is one Date.now() and a counter increment per event.
const EPS_LOG_INTERVAL_MS = 60_000;
let epsTotalEvents = 0;
let epsStartTime: number | null = null;
let epsLastLogTime = 0;

function recordEventForEps(): void {
  const now = Date.now();
  if (epsStartTime === null) {
    epsStartTime = now;
    epsLastLogTime = now;
  }
  epsTotalEvents++;
  if (now - epsLastLogTime <= EPS_LOG_INTERVAL_MS) return;
  const durationSec = (now - epsStartTime) / 1000;
  logger.info({
    msg: "Indexing throughput",
    events: epsTotalEvents,
    durationSec: Number(durationSec.toFixed(1)),
    eps: Number((epsTotalEvents / durationSec).toFixed(2)),
  });
  epsLastLogTime = now;
}

/**
 * Execute any necessary preconditions before running an event handler
 * for a given event type.
 */
async function eventHandlerPreconditions(eventType: EventTypeId): Promise<void> {
  recordEventForEps();

  switch (eventType) {
    case EventTypeIds.Setup: {
      return;
    }

    case EventTypeIds.OnchainEvent: {
      if (initIndexingOnchainEventsPromise === null) {
        initIndexingOnchainEventsPromise = import("./init-indexing-onchain-events").then(
          ({ initIndexingOnchainEvents }) => initIndexingOnchainEvents(),
        );
      }

      return await initIndexingOnchainEventsPromise;
    }
  }
}

/**
 * Ponder-backed implementation of {@link IndexingEngineAdapter}.
 *
 * Each call to {@link ponderAdapter.on} registers the handler with Ponder and
 * adapts the context/event to the engine-agnostic shape before invoking the
 * shared handler.
 */
export const ponderAdapter: IndexingEngineAdapter = {
  on<Args extends Record<string, unknown> = any>(
    eventName: string,
    handler: (args: {
      context: IndexingEngineContext;
      event: IndexingEngineEvent<Args>;
    }) => Promise<void> | void,
  ) {
    const eventType = buildEventTypeId(eventName);

    return ponder.on(eventName as EventNames, async ({ context, event }) => {
      await eventHandlerPreconditions(eventType);
      await handler({
        context: buildIndexingEngineContext(context),
        event: event as unknown as IndexingEngineEvent<Args>,
      });
    });
  },
};
