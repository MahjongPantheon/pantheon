ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-backend-common-v3-${CONTAINER_ARCH}:latest

# these should match auth data in dbinit_hugin.sql
ENV PHINX_DB_HUGIN_NAME=hugin
ENV PHINX_DB_HUGIN_NAME_UNIT=hugin_unit
ENV PHINX_DB_HUGIN_USER=hugin
ENV PHINX_DB_HUGIN_PASS=pgpass
ENV PHP_IDE_CONFIG="serverName=pantheon_hugin"

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY hugin-container.nginx.conf /etc/nginx/http.d/hugin.conf

# Copy cron defs
COPY cron/tabs/nobody /var/spool/cron/crontabs/nobody

COPY config/install_prometheus.sh /install_prometheus.sh
COPY config/prometheus_partial_config.conf /prometheus_partial_config.conf
RUN bash /install_prometheus.sh

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Hugin
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

