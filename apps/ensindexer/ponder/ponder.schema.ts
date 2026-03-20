/**
 * Export database schema definition for ENSIndexer
 * Note: Ponder uses `globalThis.PONDER_NAMESPACE_BUILD.schema` value to
 * dynamically build the "concrete" ENSIndexer Schema definition
 * from the "abstract" ENSIndexer Schema definition for Ponder app to use.
 *
 * @see https://github.com/ponder-sh/ponder/blob/c8f6935fb65176c01b40cae9056be704c0e5318e/packages/core/src/build/index.ts#L380-L424
 * @see https://github.com/ponder-sh/ponder/blob/6fcc15d4234e43862cb6e21c05f3c57f4c2f7464/packages/core/src/drizzle/onchain.ts#L280-L281
 **/
export * from "@ensnode/ensdb-sdk/ensindexer";
