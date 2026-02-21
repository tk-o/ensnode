import config from "@/config";

import { secondsToMilliseconds } from "date-fns";

import {
  type CrossChainIndexingStatusSnapshot,
  type Duration,
  EnsIndexerClient,
  EnsIndexerIndexingStatusResponseCodes,
  type EnsIndexerPublicConfig,
  OmnichainIndexingStatusIds,
  validateEnsIndexerPublicConfigCompatibility,
} from "@ensnode/ensnode-sdk";

import { EnsDbClient } from "./client";

const ensDbClient = new EnsDbClient();
const ensIndexerClient = new EnsIndexerClient({ url: config.ensIndexerUrl });

/**
 * Interval in seconds between two consecutive attempts to upsert
 * the Indexing Status Snapshot record into ENSDb.
 */
const INDEXING_STATUS_RECORD_UPDATE_INTERVAL: Duration = 5;

/**
 * ENSDb Writer Worker
 */
export class EnsDbWriterWorker {
  #isStopped = false;

  /**
   * Run the ENSDb Writer Worker
   *
   * The worker performs the following tasks:
   * 1) A single attempt to upsert ENSDb version into ENSDb.
   * 2) A single attempt to upsert serialized representation of
   *   {@link EnsIndexerPublicConfig} into ENSDb.
   * 3) A recurring attempt to upsert serialized representation of
   *    {@link CrossChainIndexingStatusSnapshot} into ENSDb.
   */
  public async run(): Promise<void> {
    const inMemoryConfig = await this.getValidatedEnsIndexerPublicConfig();

    // Task 1: upsert ENSDb version into ENSDb.
    console.log(`[EnsDbWriterWorker]: Upserting ENSDb version into ENSDb...`);
    await ensDbClient.upsertEnsDbVersion(inMemoryConfig.versionInfo.ensDb);
    console.log(
      `[EnsDbWriterWorker]: ENSDb version upserted successfully: ${inMemoryConfig.versionInfo.ensDb}`,
    );

    // Task 2: upsert serialized representation of
    // EnsIndexerPublicConfig into ENSDb.
    console.log(`[EnsDbWriterWorker]: Upserting ENSIndexer Public Config into ENSDb...`);
    await ensDbClient.upsertEnsIndexerPublicConfig(inMemoryConfig);
    console.log(`[EnsDbWriterWorker]: ENSIndexer Public Config upserted successfully`);

    // Task 3: recurring upsert of serialized representation of
    // Indexing Status Snapshot into ENSDb.
    for await (const snapshot of this.validatedIndexingStatusSnapshotStream()) {
      await ensDbClient.upsertIndexingStatusSnapshot(snapshot);
    }
  }

  /**
   * Stop the ENSDb Writer Worker
   *
   * Stops all recurring tasks in the worker.
   */
  public stop(): void {
    this.#isStopped = true;
  }

  /**
   * Get validated ENSIndexer Public Config object for the ENSDb Writer Worker.
   *
   * The function retrieves the ENSIndexer Public Config object from both:
   * - stored config in ENSDb, if available, and
   * - in-memory config from ENSIndexer Client.
   *
   * If, and only if, a stored config is available in ENSDb, then the function
   * validates the compatibility of the in-memory config object against
   * the stored one. Validation criteria are defined in the function body.
   *
   * @returns In-memory config object, if the validation is successful or
   *          if there is no stored config.
   * @throws Error if the in-memory config object is incompatible with
   *         the stored one.
   */
  private async getValidatedEnsIndexerPublicConfig(): Promise<EnsIndexerPublicConfig> {
    const [storedConfig, inMemoryConfig] = await Promise.all([
      ensDbClient.getEnsIndexerPublicConfig(),
      ensIndexerClient.config(),
    ]);

    // Validate in-memory config object compatibility with the stored one,
    // if the stored one is available
    if (storedConfig) {
      try {
        validateEnsIndexerPublicConfigCompatibility(storedConfig, inMemoryConfig);
      } catch (error) {
        const errorMessage = `In-memory ENSIndexer Public Config object is not compatible with its counterpart stored in ENSDb.`;

        console.error(`[EnsDbWriterWorker]: ${errorMessage}`);

        // Throw the error to terminate the ENSIndexer process due to
        // found config incompatibility
        throw new Error(errorMessage, {
          cause: error,
        });
      }
    }

    return inMemoryConfig;
  }

  /**
   * Indexing Status Snapshot Stream
   *
   * An async generator function that yields validated Indexing Status Snapshots
   * retrieved from ENSIndexer at a regular interval defined by
   * `INDEXING_STATUS_RECORD_UPDATE_INTERVAL`. Validation criteria are defined
   * in the function body. The generator stops yielding snapshots when the
   * worker is stopped.
   *
   * Note: failure to retrieve the Indexing Status from ENSIndexer or failure
   * to validate the retrieved Indexing Status Snapshot does not cause the
   * generator to throw an error. Instead, the generator continues with the
   * next attempt after the specified delay.
   *
   * @yields validated Indexing Status Snapshots retrieved from ENSIndexer.
   *          Validation criteria are defined in the function body.
   * @returns void when the worker is stopped.
   */
  private async *validatedIndexingStatusSnapshotStream(): AsyncGenerator<CrossChainIndexingStatusSnapshot> {
    while (!this.#isStopped) {
      try {
        const inMemoryIndexingStatus = await ensIndexerClient.indexingStatus();

        // Invariant: the Indexing Status response must have "Ok" response code to be processed.
        if (inMemoryIndexingStatus.responseCode !== EnsIndexerIndexingStatusResponseCodes.Ok) {
          throw new Error(
            `Indexing Status response must have "Ok" response code to be processed. Received response code: ${inMemoryIndexingStatus.responseCode}`,
          );
        }

        const { snapshot } = inMemoryIndexingStatus.realtimeProjection;
        const { omnichainSnapshot } = snapshot;

        // Invariant: the Omnichain Status must indicate that indexing has started already.
        if (omnichainSnapshot.omnichainStatus === OmnichainIndexingStatusIds.Unstarted) {
          throw new Error("Omnichain Status must not be 'Unstarted'.");
        }

        // Yield the validated indexing status snapshot
        yield snapshot;
      } catch (error) {
        console.error(
          `[EnsDbWriterWorker]: Error retrieving or validating Indexing Status Snapshot:`,
          error,
        );
        // Do not throw the error, as failure to retrieve the Indexing Status
        // should not cause the ENSDb Writer Worker to stop functioning.
        // Instead, continue with the next attempt after the delay.
      } finally {
        // Regardless of success or failure of the attempt to retrieve the Indexing Status,
        // wait for the specified interval before the next attempt.
        await new Promise((resolve) =>
          setTimeout(resolve, secondsToMilliseconds(INDEXING_STATUS_RECORD_UPDATE_INTERVAL)),
        );
      }
    }
  }
}
