ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-backend-common-v3-${CONTAINER_ARCH}:latest

ENV PHP_IDE_CONFIG="serverName=pantheon_meili"

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy supervisor config
COPY supervisord.conf /etc/supervisord.conf

# copy nginx configs
COPY meili-container.nginx.conf /etc/nginx/http.d/meili.conf

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Meili
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

