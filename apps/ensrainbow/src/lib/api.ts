import type { EnsRainbow } from "@ensnode/ensrainbow-sdk";
import { StatusCode } from "@ensnode/ensrainbow-sdk";
import { Hono } from "hono";
import type { Context as HonoContext } from "hono";
import { cors } from "hono/cors";

import packageJson from "@/../package.json";
import { ENSRainbowDB, SCHEMA_VERSION } from "@/lib/database";
import { ENSRainbowServer } from "@/lib/server";
import { logger } from "@/utils/logger";

/**
 * Creates and configures an ENS Rainbow api
 */
export async function createApi(db: ENSRainbowDB): Promise<Hono> {
  const api = new Hono();
  const server = await ENSRainbowServer.init(db);

  // Enable CORS for all versioned API routes
  api.use(
    "/v1/*",
    cors({
      // Allow all origins
      origin: "*",
      // ENSRainbow API is read-only, so only allow read methods
      allowMethods: ["HEAD", "GET", "OPTIONS"],
    }),
  );

  api.get("/v1/heal/:labelHash", async (c: HonoContext) => {
    const labelHash = c.req.param("labelHash") as `0x${string}`;
    logger.debug(`Healing request for labelHash: ${labelHash}`);
    const result = await server.heal(labelHash);
    logger.debug(`Heal result:`, result);
    return c.json(result, result.errorCode);
  });

  api.get("/health", (c: HonoContext) => {
    logger.debug("Health check request");
    const result: EnsRainbow.HealthResponse = { status: "ok" };
    return c.json(result);
  });

  api.get("/v1/labels/count", async (c: HonoContext) => {
    logger.debug("Label count request");
    const result = await server.labelCount();
    logger.debug(`Count result:`, result);
    return c.json(result, result.errorCode);
  });

  api.get("/v1/version", (c: HonoContext) => {
    logger.debug("Version request");
    const result: EnsRainbow.VersionResponse = {
      status: StatusCode.Success,
      versionInfo: {
        version: packageJson.version,
        schema_version: SCHEMA_VERSION,
      },
    };
    logger.debug(`Version result:`, result);
    return c.json(result);
  });

  return api;
}
