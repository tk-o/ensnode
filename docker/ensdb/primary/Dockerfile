FROM ghcr.io/railwayapp-templates/postgres-ssl:17

# Configure the ENSDb primary for streaming replication.
# init-replication.sh runs during the postgres entrypoint's temporary server
# (initdb time), so ALTER SYSTEM changes and pg_hba.conf edits take effect on
# the real server when it starts.
COPY --chmod=755 init-replication.sh /docker-entrypoint-initdb.d/99-init-replication.sh
