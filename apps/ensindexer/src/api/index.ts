import packageJson from "@/../package.json";

import { db, publicClients } from "ponder:api";
import schema from "ponder:schema";
import { Hono, MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { graphql as ponderGraphQL } from "ponder";

import { sdk } from "@/api/lib/instrumentation";
import config from "@/config";
import { makeApiDocumentationMiddleware } from "@/lib/api-documentation";
import { filterSchemaExtensions } from "@/lib/filter-schema-extensions";
import { fixContentLengthMiddleware } from "@/lib/fix-content-length-middleware";
import {
  fetchEnsRainbowVersion,
  fetchFirstBlockToIndexByChainId,
  fetchPonderStatus,
  fetchPrometheusMetrics,
  makePonderMetadataProvider,
} from "@/lib/ponder-metadata-provider";
import { ponderMetadata } from "@ensnode/ponder-metadata";
import {
  buildGraphQLSchema as buildSubgraphGraphQLSchema,
  graphql as subgraphGraphQL,
} from "@ensnode/ponder-subgraph";
import ensNodeApi from "./handlers/ensnode-api";

const schemaWithoutExtensions = filterSchemaExtensions(schema);

const app = new Hono();

const ensNodeVersionResponseHeader: MiddlewareHandler = async (ctx, next) => {
  ctx.header("x-ensnode-version", packageJson.version);
  return next();
};

app.use(
  // set the X-ENSNode-Version header to the current version
  ensNodeVersionResponseHeader,

  // use CORS middleware
  cors({ origin: "*" }),
);

app.onError((error, ctx) => {
  // log the error for operators
  console.error(error);

  return ctx.text("Internal server error", 500);
});

// use root to redirect to the environment's ENSAdmin URL configured to connect back to the environment's ENSNode Public URL
app.use("/", async (ctx) => {
  try {
    const ensAdminRedirectUrl = new URL(config.ensAdminUrl);
    ensAdminRedirectUrl.searchParams.set("ensnode", config.ensNodePublicUrl.href);

    return ctx.redirect(ensAdminRedirectUrl);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    throw new Error(`Cannot redirect to ENSAdmin: ${errorMessage}`);
  }
});

// use ENSNode middleware at /metadata
app.get(
  "/metadata",
  ponderMetadata({
    app: {
      name: packageJson.name,
      version: packageJson.version,
    },
    env: {
      PLUGINS: config.plugins.join(","),
      DATABASE_SCHEMA: config.databaseSchemaName,
      NAMESPACE: config.namespace,
    },
    db,
    query: {
      firstBlockToIndexByChainId: fetchFirstBlockToIndexByChainId,
      prometheusMetrics: fetchPrometheusMetrics,
      ensRainbowVersion: fetchEnsRainbowVersion,
      ponderStatus: fetchPonderStatus,
    },
    publicClients,
  }),
);

// use ENSNode HTTP API at /api
app.route("/api", ensNodeApi);

// use ponder middleware at `/ponder` with description injection
app.use("/ponder", fixContentLengthMiddleware);
app.use("/ponder", makeApiDocumentationMiddleware("/ponder"));
app.use("/ponder", ponderGraphQL({ db, schema: schemaWithoutExtensions }));

// use our custom graphql middleware at /subgraph with description injection
app.use("/subgraph", fixContentLengthMiddleware);
app.use("/subgraph", makeApiDocumentationMiddleware("/subgraph"));
app.use(
  "/subgraph",
  subgraphGraphQL({
    db,
    graphqlSchema: buildSubgraphGraphQLSchema({
      schema: schemaWithoutExtensions,
      // provide the schema with ponder's internal metadata to power _meta
      metadataProvider: makePonderMetadataProvider({ db, publicClients }),
      // describes the polymorphic (interface) relationships in the schema
      polymorphicConfig: {
        types: {
          DomainEvent: [
            schema.transfer,
            schema.newOwner,
            schema.newResolver,
            schema.newTTL,
            schema.wrappedTransfer,
            schema.nameWrapped,
            schema.nameUnwrapped,
            schema.fusesSet,
            schema.expiryExtended,
          ],
          RegistrationEvent: [schema.nameRegistered, schema.nameRenewed, schema.nameTransferred],
          ResolverEvent: [
            schema.addrChanged,
            schema.multicoinAddrChanged,
            schema.nameChanged,
            schema.abiChanged,
            schema.pubkeyChanged,
            schema.textChanged,
            schema.contenthashChanged,
            schema.interfaceChanged,
            schema.authorisationChanged,
            schema.versionChanged,
          ],
        },
        fields: {
          "Domain.events": "DomainEvent",
          "Registration.events": "RegistrationEvent",
          "Resolver.events": "ResolverEvent",
        },
      },
    }),
  }),
);

// Start/Terminate ENSNode API OpenTelemetry SDK
sdk.start();

// gracefully shut down the SDK on process interrupt/exit
const shutdownOpenTelemetry = () =>
  sdk.shutdown().catch((error) => console.error("Error terminating tracing", error));
process.on("SIGINT", shutdownOpenTelemetry);
process.on("SIGTERM", shutdownOpenTelemetry);

export default app;
