import { serve } from "@hono/node-server";

import { getReferralLeaderboardEditionsCaches } from "@/cache/referral-leaderboard-editions.cache";
import { redactEnsApiConfig } from "@/config/redact";
import { sdk } from "@/lib/instrumentation";
import logger from "@/lib/logger";
import { writeGraphQLSchema } from "@/omnigraph-api/lib/write-graphql-schema";

import app from "./app";
import ensApiContext from "./context";

// start ENSNode API OpenTelemetry SDK
sdk.start();

// start hono server
const server = serve(
  {
    fetch: app.fetch,
    get port() {
      const { port } = ensApiContext.ensApiConfig;
      return port;
    },
  },
  async (info) => {
    logger.info(
      { config: redactEnsApiConfig(ensApiContext.ensApiConfig) },
      `ENSApi listening on port ${info.port}`,
    );

    // Write the generated graphql schema in the background
    void writeGraphQLSchema();

    // initialize cache instances
    void ensApiContext.indexingStatusCache;
    void ensApiContext.referralProgramEditionConfigSetCache;
    void ensApiContext.stackInfoCache;
  },
);

// promisify hono server.close
const closeServer = () =>
  new Promise<void>((resolve, reject) =>
    server.close((err) => {
      if (err) return reject(err);
      resolve();
    }),
  );

// perform graceful shutdown
const gracefulShutdown = async () => {
  try {
    const { referralProgramEditionConfigSetCache, indexingStatusCache } = ensApiContext;

    await sdk.shutdown();
    logger.info("Destroyed tracing instrumentation");

    // Destroy referral program edition config set cache
    referralProgramEditionConfigSetCache.destroy();
    logger.info("Destroyed referralProgramEditionConfigSetCache");

    // Destroy all edition caches (if initialized)
    const editionsCaches = getReferralLeaderboardEditionsCaches();
    if (editionsCaches) {
      for (const [editionSlug, cache] of editionsCaches) {
        cache.destroy();
        logger.info(`Destroyed referralLeaderboardEditionsCache for ${editionSlug}`);
      }
    }

    indexingStatusCache.destroy();
    logger.info("Destroyed indexingStatusCache");

    await closeServer();
    logger.info("Closed application server");

    process.exit(0);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

// graceful shutdown
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

process.on("uncaughtException", async (error) => {
  logger.error(error, "uncaughtException");
  await gracefulShutdown();
});
