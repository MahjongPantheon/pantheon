ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# copy entry point
COPY --chmod=755 entrypoint.sh /entrypoint.sh

# copy nginx configs
COPY forseti-container.nginx.conf /etc/nginx/http.d/forseti.conf

# Folders init
RUN mkdir -p /var/www/html/Forseti
RUN mkdir -p /var/www/html/Forseti-dist
