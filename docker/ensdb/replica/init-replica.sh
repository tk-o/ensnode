#!/bin/bash
set -e

# This entrypoint is used by the ENSDb read replica. It waits for the primary,
# clones it with pg_basebackup on first start, then hands off to the original
# Railway postgres-ssl wrapper.sh which manages SSL certificates and starts
# postgres in standby mode.

PRIMARY_HOST="${PRIMARY_HOST:-}"
PRIMARY_PORT="${PRIMARY_PORT:-5432}"
REPLICATOR_USER="${REPLICATOR_USER:-replicator}"
REPLICATOR_PASSWORD="${REPLICATOR_PASSWORD:-replicator}"
REPLICA_SSLMODE="${REPLICA_SSLMODE:-require}"

if [ -z "$PRIMARY_HOST" ]; then
    echo "ERROR: PRIMARY_HOST must be set to the primary PostgreSQL hostname."
    exit 1
fi

echo "ENSDB replica: primary=${PRIMARY_HOST}:${PRIMARY_PORT}, replicator=${REPLICATOR_USER}, sslmode=${REPLICA_SSLMODE}"

# Wait until the primary accepts replication connections.
echo "ENSDB replica: waiting for primary to be ready..."
until pg_isready -h "$PRIMARY_HOST" -p "$PRIMARY_PORT" -U "$REPLICATOR_USER" -q 2>/dev/null; do
    echo "ENSDB replica: primary not ready, sleeping 5s..."
    sleep 5
done

# If the data directory is empty we clone the primary. Otherwise, a previous
# clone is reused and postgres will resume streaming from where it left off.
if [ -z "$(ls -A "$PGDATA" 2>/dev/null)" ]; then
    echo "ENSDB replica: PGDATA is empty, cloning from primary with pg_basebackup..."
    mkdir -p "$PGDATA"
    chown postgres:postgres "$PGDATA"
    chmod 700 "$PGDATA"

    export PGPASSWORD="$REPLICATOR_PASSWORD"
    export PGSSLMODE="$REPLICA_SSLMODE"

    gosu postgres pg_basebackup \
        -h "$PRIMARY_HOST" \
        -p "$PRIMARY_PORT" \
        -U "$REPLICATOR_USER" \
        -D "$PGDATA" \
        -Fp \
        -Xs \
        -P \
        -R \
        -W

    echo "ENSDB replica: pg_basebackup complete"
else
    echo "ENSDB replica: existing PGDATA found, skipping pg_basebackup"
fi

# pg_basebackup -R creates standby.signal and writes primary_conninfo to
# postgresql.auto.conf, so the real server will start as a hot standby.
if [ ! -f "$PGDATA/standby.signal" ]; then
    echo "ENSDB replica: creating standby.signal"
    touch "$PGDATA/standby.signal"
    chown postgres:postgres "$PGDATA/standby.signal"
fi

echo "ENSDB replica: handing off to original Railway postgres-ssl wrapper.sh"
exec /usr/local/bin/wrapper.sh "$@"
