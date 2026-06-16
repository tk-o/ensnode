# Docker Compose

All commands are run from the **monorepo root**.

## Files

| File                                     | Purpose                                                                                |
| ---------------------------------------- | -------------------------------------------------------------------------------------- |
| `docker/docker-compose.yml`              | Base stack — ensindexer, ensapi, ensrainbow, ensadmin, ensdb. For mainnet/sepolia.     |
| `docker/docker-compose.devnet.yml`       | Full stack against local devnet (`ens-test-env`). Includes all base services + devnet. |
| `docker/docker-compose.orchestrator.yml` | Minimal infra for CI — devnet + ensdb only. Used by `orchestrator.ts`.                 |
| `docker/services/*.yml`                  | Individual service definitions. Extended by the compose files above.                   |
| `docker/envs/.env.docker.common`         | Shared env defaults (ensdb credentials, internal service URLs). Committed.             |
| `docker/envs/.env.docker.devnet`         | Devnet defaults (PLUGINS, etc.). Committed. Works out of the box.                      |
| `docker/envs/.env.docker.example`        | Example for user-specific config. Copy to `.env.docker.local` for mainnet/sepolia.     |
| `docker/envs/.env.docker.local`          | User config (gitignored). Required for base stack, optional for devnet overrides.      |

> To inspect the fully resolved config for any compose file (resolves all `extends`):
>
> ```
> docker compose -f docker/docker-compose.yml config
> ```

## Use cases

### Mainnet / Sepolia

**1. Configure environment** (one-time setup):

```bash
cp docker/envs/.env.docker.example docker/envs/.env.docker.local
```

Edit `docker/envs/.env.docker.local` and set `NAMESPACE`, `PLUGINS`, and your RPC endpoints (e.g. `ALCHEMY_API_KEY` or `RPC_URL_1`).

**2. Start/stop the stack:**

```bash
# Start full stack in background
docker compose -f docker/docker-compose.yml up -d

# Stop
docker compose -f docker/docker-compose.yml down

# Stop and remove volumes
docker compose -f docker/docker-compose.yml down -v
```

### Local devnet (for developers)

No setup required — devnet defaults are committed in `docker/envs/.env.docker.devnet`.

To override defaults (e.g. change `PLUGINS`), create `docker/envs/.env.docker.local` with your values.

```bash
# Start full stack against devnet
docker compose -f docker/docker-compose.devnet.yml up -d

# Start only devnet + core services (no ensadmin)
docker compose -f docker/docker-compose.devnet.yml up -d ensindexer ensapi

# Start only devnet (quick local EVM node, also shows data information about devnet)
docker compose -f docker/docker-compose.devnet.yml up devnet
# or
pnpm devnet

# Stop
docker compose -f docker/docker-compose.devnet.yml down
```

### Build images locally

```bash
# Build all images
pnpm docker:build:ensnode

# Build a specific image
pnpm docker:build:ensindexer
pnpm docker:build:ensapi
pnpm docker:build:ensrainbow
pnpm docker:build:ensadmin
```

### CI / integration tests

Used internally by `orchestrator.ts` via testcontainers. Starts devnet + ensdb only.

```bash
pnpm test:integration:ci
```

## Railway ENSDb read replica

For Railway deployments, two custom PostgreSQL images are provided under `docker/ensdb/`.
Both extend `ghcr.io/railwayapp-templates/postgres-ssl:17` and configure streaming
replication, so the replica can be exposed to public traffic while the primary stays
private.

Images are built and published to `ghcr.io/namehash/ensnode/ensdb-primary` and
`ghcr.io/namehash/ensnode/ensdb-replica` by the `.github/workflows/release_ensdb_images.yml`
workflow.

| Image           | Path                    | Purpose                                                              |
| --------------- | ----------------------- | -------------------------------------------------------------------- |
| `ensdb-primary` | `docker/ensdb/primary/` | Primary server that accepts writes. Keep this service private.       |
| `ensdb-replica` | `docker/ensdb/replica/` | Hot standby that streams from the primary. Make this service public. |

### Primary environment variables

- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` — standard Postgres credentials.
- `REPLICATOR_PASSWORD` — password for the dedicated replication user (`replicator` by default).
- `WAL_LEVEL`, `MAX_WAL_SENDERS`, `MAX_REPLICATION_SLOTS`, `HOT_STANDBY`, `WAL_KEEP_SIZE` — replication tunables (sensible defaults are baked in).

### Replica environment variables

- `PRIMARY_HOST` — hostname of the primary service (required).
- `PRIMARY_PORT` — primary port (default `5432`).
- `REPLICATOR_USER` — must match the primary's replication user (default `replicator`).
- `REPLICATOR_PASSWORD` — must match `REPLICATOR_PASSWORD` on the primary.
- `REPLICA_SSLMODE` — libpq SSL mode for `pg_basebackup` and streaming (default `require`).

### Important caveats

- ENSIndexer must connect to the **primary** (it is the only writer).
- ENSApi/ENSAdmin should read from the **replica** for the public traffic path.
- There is replication lag between the primary and replica; GraphQL reads served by the replica may be slightly behind the primary.
- The replica's data volume is initialized from the primary on first boot. To re-clone, redeploy the replica service with a fresh volume.
