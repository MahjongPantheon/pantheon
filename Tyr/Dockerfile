ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# copy entry point
COPY --chmod=755 entrypoint.sh /entrypoint.sh

# copy nginx configs
COPY tyr-container.nginx.conf /etc/nginx/http.d/tyr.conf

# Folders init
RUN mkdir -p /var/www/html/Tyr
RUN mkdir -p /var/www/html/Tyr-dist
