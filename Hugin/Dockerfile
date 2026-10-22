ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# these should match auth data in dbinit_hugin.sql
ENV PHINX_DB_HUGIN_NAME=hugin
ENV PHINX_DB_HUGIN_NAME_UNIT=hugin_unit
ENV PHINX_DB_HUGIN_USER=hugin
ENV PHINX_DB_HUGIN_PASS=pgpass
ENV TZ=UTC
RUN apk add --no-cache rsyslog

# copy entry point
COPY --chmod=755 entrypoint.sh /entrypoint.sh

# copy supervisor config
COPY supervisord.conf /etc/supervisord.conf

# copy nginx configs
COPY hugin-container.nginx.conf /etc/nginx/http.d/hugin.conf

# Copy cron defs
COPY cron/tabs/user /var/spool/cron/crontabs/user

COPY config/install_prometheus.sh /install_prometheus.sh
COPY config/prometheus_partial_config.conf /prometheus_partial_config.conf
RUN bash /install_prometheus.sh

# Folders init
RUN mkdir -p /var/www/html/Hugin /var/www/html/Hugin-dist
