import { publicClients } from "ponder:api";
import config from "@/config";
import { indexedChainsBlockRefs } from "@/indexing-status";
import { serializeENSIndexerPublicConfig } from "@ensnode/ensnode-sdk";
import { otel } from "@hono/otel";
import { Hono } from "hono";
import resolutionApi from "../lib/resolution-api";

const app = new Hono();

// include automatic OpenTelemetry instrumentation for incoming requests
app.use("*", otel());

app.get("/config", (c) => c.json(serializeENSIndexerPublicConfig(config)));

// TODO: apply @{link serializeENSIndexerIndexingStatus}
app.get("/indexing-status", async (c) => c.json(await indexedChainsBlockRefs));

// conditionally include experimental resolution api
if (config.experimentalResolution) {
  app.route("/resolve", resolutionApi);
}

export default app;
