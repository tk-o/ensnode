import packageJson from "@/../package.json" with { type: "json" };

import { Hono } from "hono";
import { cors } from "hono/cors";

import type { ErrorResponse } from "@ensnode/ensnode-sdk";

import { EnsDbWriterWorker } from "@/lib/ensdb/writer-worker";

import ensNodeApi from "./handlers/ensnode-api";

const app = new Hono();

const ensDbWriterWorker = new EnsDbWriterWorker();

ensDbWriterWorker.run().catch((error) => {
  ensDbWriterWorker.stop();

  console.error("Error running ENSDb Writer Worker:", error);

  // Trigger Ponder graceful shutdown by throwing an error from the top-level scope of the module.
  throw error;
});

// set the X-ENSIndexer-Version header to the current version
app.use(async (ctx, next) => {
  ctx.header("x-ensindexer-version", packageJson.version);
  return next();
});

// use CORS middleware
app.use(cors({ origin: "*" }));

// use ENSNode HTTP API at /api
app.route("/api", ensNodeApi);

// log hono errors to console
app.onError((error, ctx) => {
  console.error(error);
  return ctx.json({ message: "Internal Server Error" } satisfies ErrorResponse, 500);
});

export default app;
