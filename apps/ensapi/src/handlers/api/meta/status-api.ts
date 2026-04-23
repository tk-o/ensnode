import {
  EnsApiIndexingStatusResponseCodes,
  type EnsApiIndexingStatusResponseError,
  type EnsApiIndexingStatusResponseOk,
  serializeEnsApiIndexingStatusResponse,
} from "@ensnode/ensnode-sdk";

import di from "@/di";
import { createApp } from "@/lib/hono-factory";
import { indexingStatusMiddleware } from "@/middleware/indexing-status.middleware";
import { stackInfoMiddleware } from "@/middleware/stack-info.middleware";

import { getIndexingStatusRoute } from "./status-api.routes";

const app = createApp({ middlewares: [stackInfoMiddleware, indexingStatusMiddleware] });

app.openapi(getIndexingStatusRoute, async (c) => {
  if (c.var.indexingStatus instanceof Error) {
    return c.json(
      serializeEnsApiIndexingStatusResponse({
        responseCode: EnsApiIndexingStatusResponseCodes.Error,
      } satisfies EnsApiIndexingStatusResponseError),
      503,
    );
  }

  const { stackInfo } = di.context;

  // return successful response using the indexing status projection from the middleware context
  return c.json(
    serializeEnsApiIndexingStatusResponse({
      responseCode: EnsApiIndexingStatusResponseCodes.Ok,
      realtimeProjection: c.var.indexingStatus,
      stackInfo,
    } satisfies EnsApiIndexingStatusResponseOk),
    200,
  );
});

export default app;
