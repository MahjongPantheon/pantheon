ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# copy entry point
COPY --chmod=755 entrypoint.sh /entrypoint.sh

# copy nginx configs
COPY frey-container.nginx.conf /etc/nginx/http.d/frey.conf

# copy supervisor config
COPY supervisord.conf /etc/supervisord.conf

# Copy cron defs
COPY cron/tabs/nobody /var/spool/cron/crontabs/nobody

# Folders init
RUN mkdir -p /var/www/html/Frey
