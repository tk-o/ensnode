/**
 * This is ponder's graphql/middleware.ts with the following changes:
 * 0. removes internal typings
 * 1. removed ponder's GraphiQL, enabled graphql-yoga's GraphiQL.
 * 2. builds our custom subgraph-compatible schema instead of ponder's
 * 3. removes schema.graphql generation
 * 4. emits stack traces to console.log
 */

import { maxAliasesPlugin } from "@escape.tech/graphql-armor-max-aliases";
import { maxDepthPlugin } from "@escape.tech/graphql-armor-max-depth";
import { maxTokensPlugin } from "@escape.tech/graphql-armor-max-tokens";
import { createYoga } from "graphql-yoga";
import { createMiddleware } from "hono/factory";

import { makeDrizzle } from "./drizzle";
import {
  type BuildGraphQLSchemaOptions,
  buildDataLoaderCache,
  buildGraphQLSchema,
} from "./graphql";

/**
 * GraphQL Yoga Plugin Options
 *
 * Used in {@link buildYogaServer} to configure the GraphQL Yoga plugins.
 */
interface GraphQLYogaPluginOptions {
  maxOperationTokens?: number;
  maxOperationDepth?: number;
  maxOperationAliases?: number;
}

/**
 * GraphQL Yoga Options
 *
 * Used to configure the GraphQL Yoga server instance that is created in the {@link subgraphGraphQLMiddleware}.
 */
interface GraphQLYogaOptions extends BuildGraphQLSchemaOptions, GraphQLYogaPluginOptions {
  /**
   * The URL of the database to connect to.
   *
   * Used by the Drizzle ORM instance that is created for the GraphQL Yoga server.
   */
  databaseUrl: string;

  /**
   * The name of the database schema.
   *
   * Used by the Drizzle ORM instance that is created for the GraphQL Yoga server.
   */
  databaseSchema: string;
}

/**
 * Builds a GraphQL Yoga server instance with the provided options.
 */
function buildYogaServer(options: GraphQLYogaOptions) {
  const {
    schema,
    polymorphicConfig,
    databaseUrl,
    databaseSchema,
    // Default limits are from Apollo:
    // https://www.apollographql.com/blog/prevent-graph-misuse-with-operation-size-and-complexity-limit
    maxOperationTokens = 1000,
    maxOperationDepth = 100,
    maxOperationAliases = 30,
  } = options;

  // make subgraph-specific drizzle db
  const drizzle = makeDrizzle({ schema, databaseUrl, databaseSchema });

  const graphqlSchema = buildGraphQLSchema({ schema, polymorphicConfig });

  return createYoga({
    graphqlEndpoint: "*", // Disable built-in route validation, use Hono routing instead
    schema: graphqlSchema,
    context: () => {
      const getDataLoader = buildDataLoaderCache({ drizzle });

      return { drizzle, getDataLoader };
    },
    maskedErrors:
      process.env.NODE_ENV === "production"
        ? true
        : {
            maskError(error: unknown) {
              console.error(error);
              if (error instanceof Error) return error;
              return new Error(`Internal Server Error`);
            },
          },
    logging: false,
    graphiql: true,
    parserAndValidationCache: false,
    plugins: [
      maxTokensPlugin({ n: maxOperationTokens }),
      maxDepthPlugin({ n: maxOperationDepth, ignoreIntrospection: false }),
      maxAliasesPlugin({ n: maxOperationAliases, allowList: [] }),
    ],
  });
}

interface SubgraphGraphQLMiddlewareOptions {
  getYogaOptions(): GraphQLYogaOptions;
}

/**
 * Subgraph GraphQL Middleware
 *
 * Uses a lazy-initialized GraphQL Yoga server to handle GraphQL requests.
 */
export function subgraphGraphQLMiddleware({ getYogaOptions }: SubgraphGraphQLMiddlewareOptions) {
  let yoga: ReturnType<typeof buildYogaServer> | undefined;

  return createMiddleware(async (c) => {
    // Lazily initialize the Yoga server on the first request, using the provided options.
    if (!yoga) {
      yoga = buildYogaServer(getYogaOptions());
    }

    const response = await yoga.handle(c.req.raw, c.var);

    // TODO: Figure out why Yoga is returning 500 status codes for GraphQL errors.
    // @ts-expect-error
    response.status = 200;
    // @ts-expect-error
    response.statusText = "OK";

    return response;
  });
}
