ARG CONTAINER_ARCH
FROM ghcr.io/mahjongpantheon/pantheon-backend-common-v3-${CONTAINER_ARCH}:latest

# these should match auth data in dbinit.sql
ENV PHINX_DB_NAME=mimir
ENV PHINX_DB_NAME_UNIT=mimir_unit
ENV PHINX_DB_USER=mimir
ENV PHINX_DB_PASS=pgpass
ENV PHP_IDE_CONFIG="serverName=pantheon_mimir"

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY mimir-container.nginx.conf /etc/nginx/http.d/mimir.conf

# Copy cron defs
COPY cron/tabs/nobody /var/spool/cron/crontabs/nobody

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Mimir
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

