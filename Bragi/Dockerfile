ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# copy entry point
COPY --chmod=755 entrypoint.sh /entrypoint.sh

# copy supervisor config
COPY supervisord.conf /etc/supervisord.conf

# copy nginx configs
COPY bragi-container.nginx.conf /etc/nginx/http.d/bragi.conf

# Folders init
RUN mkdir -p /var/www/html/Bragi
RUN mkdir -p /var/www/html/Bragi-dist
