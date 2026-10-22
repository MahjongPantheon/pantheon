ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

COPY --chmod=755 entrypoint.sh /entrypoint.sh
COPY supervisord.conf /etc/supervisord.conf
COPY gullveig-container.nginx.conf /etc/nginx/http.d/gullveig.conf
RUN mkdir -p /var/www/html/Gullveig /var/www/html/Gullveig-dist
