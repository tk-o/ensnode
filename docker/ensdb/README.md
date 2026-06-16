# ENSDb servers: Primary and Replica

## Railway ENSDb read replica

For Railway deployments, two custom PostgreSQL images are provided under `ensdb/`.
Both extend `ghcr.io/railwayapp-templates/postgres-ssl:17` and configure streaming
replication, so the replica can be exposed to public traffic while the primary stays
private.

| Image           | Path             | Purpose                                                              |
| --------------- | ---------------- | -------------------------------------------------------------------- |
| `ensdb-primary` | `ensdb/primary/` | Primary server that accepts writes. Keep this service private.       |
| `ensdb-replica` | `ensdb/replica/` | Hot standby that streams from the primary. Make this service public. |

### Primary environment variables

- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` — standard Postgres credentials.
- `REPLICATOR_PASSWORD` — password for the dedicated replication user. Required; no default.
- `WAL_LEVEL`, `MAX_WAL_SENDERS`, `MAX_REPLICATION_SLOTS`, `HOT_STANDBY`, `WAL_KEEP_SIZE` — replication tunables (sensible defaults are baked in).

### Replica environment variables

- `PRIMARY_HOST` — hostname of the primary service (required).
- `PRIMARY_PORT` — primary port (default `5432`).
- `REPLICATOR_USER` — must match the primary's replication user (default `replicator`).
- `REPLICATOR_PASSWORD` — must match `REPLICATOR_PASSWORD` on the primary. Required; no default.
- `REPLICA_SSLMODE` — libpq SSL mode for `pg_basebackup` and streaming (default `require`).

### Important caveats

- ENSDb Writers must connect to the **primary** (it is the sole writer).
- ENSDb Readers should read from the **replica** for the public traffic path.
- There is replication lag between the primary and replica; reads served by the replica may be slightly behind the primary.
- The replica's data volume is initialized from the primary on first boot. To re-clone, redeploy the replica service with a fresh volume.

## Local testing

A Docker Compose test harness is provided in `docker-compose.test.yml`. It
builds the primary and replica images, starts both databases, and runs a
`test` service that executes the `test-replication.sh` shell script.

```bash
cd docker/ensdb
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from test
```

The test service verifies:

- the primary accepts writes,
- changes replicate to the replica,
- the replica rejects writes (read-only hot standby).

The test exits with code 0 on success. Clean up afterward with:

```bash
docker compose -f docker-compose.test.yml down --volumes
```

The compose file also exposes the primary on `localhost:5432` and the replica
on `localhost:5433`, so you can run the same `test-replication.sh` script from
the host if you have `psql` installed:

```bash
docker compose -f docker-compose.test.yml up --build -d
./test-replication.sh
```
