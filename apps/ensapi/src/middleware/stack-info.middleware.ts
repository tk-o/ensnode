import type { EnsNodeStackInfo } from "@ensnode/ensnode-sdk";

import di from "@/di";
import { factory } from "@/lib/hono-factory";
import { makeLogger } from "@/lib/logger";

const logger = makeLogger("stack-info.middleware");
/**
 * Makes the {@link EnsNodeStackInfo} object cached in {@link di.context.stackInfo}.
 */
export const stackInfoMiddleware = factory.createMiddleware(async (c, next) => {
  const stackInfo = await di.context.stackInfoCache.read();

  // The stack info is critical for the functioning of the ENSApi instance.
  // If it fails to load, we return a 503 response and log the error.
  if (stackInfo instanceof Error) {
    logger.error(
      { error: stackInfo },
      "Failed to retrieve ENSNode Stack Info in stackInfoMiddleware",
    );

    return c.json(
      {
        error: "Service Unavailable",
        details:
          "This ENSApi instance is not ready to handle requests yet. Please try again later.",
      },
      503,
    );
  }

  di.context.stackInfo = stackInfo;

  await next();
});
