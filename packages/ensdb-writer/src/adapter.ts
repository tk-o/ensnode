import type { IndexingEngineContext, IndexingEngineEvent } from "./types";

/**
 * Adapter interface that an indexing engine must implement to run the
 * engine-agnostic ENSDb indexing handlers.
 */
export interface IndexingEngineAdapter {
  /**
   * Register a handler for an onchain event.
   *
   * @param eventName - Engine-specific event name (e.g. Ponder's `"plugin/Contract:Event"`).
   * @param handler - Handler receiving an engine-agnostic context and event.
   */
  on<Args extends Record<string, unknown> = any>(
    eventName: string,
    handler: (args: {
      context: IndexingEngineContext;
      event: IndexingEngineEvent<Args>;
    }) => Promise<void> | void,
  ): void;
}
