import config from "@/config";

import { publicClients as ponderPublicClients } from "ponder:api";
import { getUnixTime } from "date-fns";
import { Hono } from "hono";

import {
  createRealtimeIndexingStatusProjection,
  deserializeChainId,
  IndexingStatusResponseCodes,
  type IndexingStatusResponseError,
  type IndexingStatusResponseOk,
  type OmnichainIndexingStatusSnapshot,
  serializeENSIndexerPublicConfig,
  serializeIndexingStatusResponse,
} from "@ensnode/ensnode-sdk";
import { PonderClient } from "@ensnode/ponder-sdk";

import { buildENSIndexerPublicConfig } from "@/config/public";
import {
  buildOmnichainIndexingStatusSnapshot,
  createCrossChainIndexingStatusSnapshotOmnichain,
} from "@/lib/indexing-status/build-index-status";

const app = new Hono();

const ponderClient = new PonderClient(config.ensIndexerUrl);

const publicClients = new Map(
  Object.entries(ponderPublicClients).map(
    ([chainId, publicClient]) => [deserializeChainId(chainId), publicClient] as const,
  ),
);

// include ENSIndexer Public Config endpoint
app.get("/config", async (c) => {
  // prepare the public config object, including dependency info
  const publicConfig = await buildENSIndexerPublicConfig(config);

  // respond with the serialized public config object
  return c.json(serializeENSIndexerPublicConfig(publicConfig));
});

app.get("/indexing-status", async (c) => {
  // get system timestamp for the current request
  const snapshotTime = getUnixTime(new Date());

  let omnichainSnapshot: OmnichainIndexingStatusSnapshot | undefined;

  try {
    omnichainSnapshot = await buildOmnichainIndexingStatusSnapshot(ponderClient, publicClients);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Omnichain snapshot is currently not available: ${errorMessage}`);
  }

  // return IndexingStatusResponseError
  if (typeof omnichainSnapshot === "undefined") {
    return c.json(
      serializeIndexingStatusResponse({
        responseCode: IndexingStatusResponseCodes.Error,
      } satisfies IndexingStatusResponseError),
      500,
    );
  }

  // otherwise, proceed with creating IndexingStatusResponseOk
  const crossChainSnapshot = createCrossChainIndexingStatusSnapshotOmnichain(
    omnichainSnapshot,
    snapshotTime,
  );

  const projectedAt = getUnixTime(new Date());
  const realtimeProjection = createRealtimeIndexingStatusProjection(
    crossChainSnapshot,
    projectedAt,
  );

  // return the serialized indexing status response object
  return c.json(
    serializeIndexingStatusResponse({
      responseCode: IndexingStatusResponseCodes.Ok,
      realtimeProjection,
    } satisfies IndexingStatusResponseOk),
  );
});

export default app;
