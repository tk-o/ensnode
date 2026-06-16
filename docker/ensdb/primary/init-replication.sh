#!/bin/bash
set -e

# This script runs once during initdb, inside the temporary postgres server.
# It enables streaming replication on the ENSDb primary and creates a
# dedicated replication user. Settings are written via ALTER SYSTEM so they
# are active when the real server starts.

# tunables via env
WAL_LEVEL="${WAL_LEVEL:-replica}"
MAX_WAL_SENDERS="${MAX_WAL_SENDERS:-10}"
MAX_REPLICATION_SLOTS="${MAX_REPLICATION_SLOTS:-10}"
HOT_STANDBY="${HOT_STANDBY:-on}"
WAL_KEEP_SIZE="${WAL_KEEP_SIZE:-1GB}"
MAX_SLOT_WAL_KEEP_SIZE="${MAX_SLOT_WAL_KEEP_SIZE:-1GB}"
REPLICATOR_USER="${REPLICATOR_USER:-replicator}"
REPLICATOR_PASSWORD="${REPLICATOR_PASSWORD:-replicator}"

echo "ENSDB primary: configuring replication (user=${REPLICATOR_USER}, wal_level=${WAL_LEVEL})"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    ALTER SYSTEM SET wal_level = '${WAL_LEVEL}';
    ALTER SYSTEM SET max_wal_senders = '${MAX_WAL_SENDERS}';
    ALTER SYSTEM SET max_replication_slots = '${MAX_REPLICATION_SLOTS}';
    ALTER SYSTEM SET hot_standby = '${HOT_STANDBY}';
    ALTER SYSTEM SET wal_keep_size = '${WAL_KEEP_SIZE}';
    ALTER SYSTEM SET max_slot_wal_keep_size = '${MAX_SLOT_WAL_KEEP_SIZE}';
EOSQL

# Create the replication user if it does not already exist.
ROLE_EXISTS=$(psql -v ON_ERROR_STOP=1 -t -A --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    -c "SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = '${REPLICATOR_USER}';")

if [ -z "$ROLE_EXISTS" ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
        -c "CREATE ROLE ${REPLICATOR_USER} WITH LOGIN REPLICATION PASSWORD '${REPLICATOR_PASSWORD}';"
    echo "ENSDB primary: created replication user ${REPLICATOR_USER}"
else
    echo "ENSDB primary: replication user ${REPLICATOR_USER} already exists"
fi

# Add pg_hba.conf rules so the replica can connect for replication.
# We allow both hostssl and host so the replica works whether Railway routes
# the connection through the internal network or over the public endpoint.
# The replicator password still protects the connection.
HBA_FILE=$(psql -v ON_ERROR_STOP=1 -t -A --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    -c "SHOW hba_file;")

{
    echo ""
    echo "# ENSDB streaming replication rules"
    echo "hostssl replication ${REPLICATOR_USER} 0.0.0.0/0 scram-sha-256"
    echo "hostssl replication ${REPLICATOR_USER} ::/0 scram-sha-256"
    echo "host replication ${REPLICATOR_USER} 0.0.0.0/0 scram-sha-256"
    echo "host replication ${REPLICATOR_USER} ::/0 scram-sha-256"
} >> "$HBA_FILE"

# Reload HBA so the temporary server sees the rules (real server will read them on start).
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    -c "SELECT pg_reload_conf();" || true

echo "ENSDB primary: replication configuration complete"
