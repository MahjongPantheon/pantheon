ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# copy entry point
COPY --chmod=755 entrypoint.sh /entrypoint.sh

# copy nginx configs
COPY mimir-container.nginx.conf /etc/nginx/http.d/mimir.conf

# copy supervisor config
COPY supervisord.conf /etc/supervisord.conf

# Folders init
RUN mkdir -p /var/www/html/Mimir
RUN mkdir -p /var/www/html/Mimir-dist
