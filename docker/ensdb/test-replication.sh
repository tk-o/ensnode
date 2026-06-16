#!/bin/bash
set -e

# Smoke test for ENSDb streaming replication.
# Run this script from the host after starting the databases with
# docker-compose.test.yml, or inside a container with the env vars set.
# Defaults assume the compose file has mapped:
#   primary -> localhost:5432
#   replica -> localhost:5433

PRIMARY_HOST="${PRIMARY_HOST:-localhost}"
PRIMARY_PORT="${PRIMARY_PORT:-5432}"
PRIMARY_USER="${PRIMARY_USER:-postgres}"
PRIMARY_PASSWORD="${PRIMARY_PASSWORD:-postgres}"
PRIMARY_DB="${PRIMARY_DB:-postgres}"

REPLICA_HOST="${REPLICA_HOST:-localhost}"
REPLICA_PORT="${REPLICA_PORT:-5433}"
REPLICA_USER="${REPLICA_USER:-postgres}"
REPLICA_PASSWORD="${REPLICA_PASSWORD:-postgres}"
REPLICA_DB="${REPLICA_DB:-postgres}"

export PGPASSWORD="$PRIMARY_PASSWORD"
PSQL_PRIMARY="psql -h $PRIMARY_HOST -p $PRIMARY_PORT -U $PRIMARY_USER -d $PRIMARY_DB -v ON_ERROR_STOP=1"

export PGPASSWORD="$REPLICA_PASSWORD"
PSQL_REPLICA="psql -h $REPLICA_HOST -p $REPLICA_PORT -U $REPLICA_USER -d $REPLICA_DB -v ON_ERROR_STOP=1"

wait_for_postgres() {
    local host="$1" port="$2" user="$3" label="$4"
    echo "TEST: waiting for $label at $host:$port..."
    until pg_isready -h "$host" -p "$port" -U "$user" -q 2>/dev/null; do
        echo "TEST: $label not ready, sleeping 2s..."
        sleep 2
    done
    echo "TEST: $label is ready"
}

wait_for_postgres "$PRIMARY_HOST" "$PRIMARY_PORT" "$PRIMARY_USER" "primary"
wait_for_postgres "$REPLICA_HOST" "$REPLICA_PORT" "$REPLICA_USER" "replica"

# Give the replica a moment to finish starting as a hot standby.
# pg_isready returns true before the server accepts normal connections in some
# edge cases, so a small extra wait keeps the first replica query reliable.
sleep 2

TEST_TABLE="replication_test"
TEST_VALUE="ensdb-replication-$(date +%s)"

echo "TEST: creating test table and writing marker on primary..."
export PGPASSWORD="$PRIMARY_PASSWORD"
$PSQL_PRIMARY -c "DROP TABLE IF EXISTS $TEST_TABLE;"
$PSQL_PRIMARY -c "CREATE TABLE $TEST_TABLE (id serial PRIMARY KEY, marker text);"
$PSQL_PRIMARY -c "INSERT INTO $TEST_TABLE (marker) VALUES ('$TEST_VALUE');"

echo "TEST: waiting for marker to replicate..."
export PGPASSWORD="$REPLICA_PASSWORD"
for i in $(seq 1 30); do
    REPLICATED=$($PSQL_REPLICA -t -A -c "SELECT marker FROM $TEST_TABLE WHERE marker = '$TEST_VALUE';" 2>/dev/null || true)
    if [ "$REPLICATED" = "$TEST_VALUE" ]; then
        echo "TEST: marker replicated successfully"
        break
    fi
    echo "TEST: replica not caught up yet, retrying... ($i/30)"
    sleep 2
done

if [ "$REPLICATED" != "$TEST_VALUE" ]; then
    echo "ERROR: marker did not replicate to the replica"
    exit 1
fi

echo "TEST: verifying replica is read-only..."
export PGPASSWORD="$REPLICA_PASSWORD"
if $PSQL_REPLICA -c "INSERT INTO $TEST_TABLE (marker) VALUES ('should-fail');" 2>/dev/null; then
    echo "ERROR: replica accepted a write; expected read-only behavior"
    exit 1
else
    echo "TEST: replica correctly rejected write (read-only)"
fi

# Clean up the test table on the primary so it doesn't linger in test volumes.
export PGPASSWORD="$PRIMARY_PASSWORD"
$PSQL_PRIMARY -c "DROP TABLE IF EXISTS $TEST_TABLE;"

echo ""
echo "=== ENSDb replication smoke test passed ==="
