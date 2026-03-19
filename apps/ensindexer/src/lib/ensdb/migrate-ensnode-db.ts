import { createRequire } from "node:module";
import { join } from "node:path";

import type { EnsNodeDbMigrations } from "@ensnode/ensdb-sdk";

// Resolve the path to the migrations directory within the ENSDb SDK package
const migrationsDirPath = join(
  createRequire(import.meta.url).resolve("@ensnode/ensdb-sdk"),
  "../../migrations",
);

/**
 * Execute database migrations for ENSNode Schema in ENSDb, using the given ENSDb client.
 * @param ensDbClient - The ENSDb client to use for executing migrations.
 */
export async function migrateEnsNodeDb(ensDbClient: EnsNodeDbMigrations): Promise<void> {
  console.log(`Running database migrations for ENSNode Schema in ENSDb.`);
  await ensDbClient.migrate(migrationsDirPath);
  console.log(`Database migrations for ENSNode Schema in ENSDb completed successfully.`);
}
