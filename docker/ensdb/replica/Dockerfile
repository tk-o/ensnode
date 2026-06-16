FROM ghcr.io/railwayapp-templates/postgres-ssl:17

# On first boot, clone the primary into PGDATA with pg_basebackup and then
# delegate to the original Railway postgres-ssl wrapper (SSL certs, PITR, etc.).
COPY --chmod=755 init-replica.sh /usr/local/bin/init-replica.sh
ENTRYPOINT ["init-replica.sh"]
CMD ["postgres", "-p", "5432", "-c", "listen_addresses=*"]
