ARG CONTAINER_ARCH
FROM ghcr.io/mahjongpantheon/pantheon-frontend-common-v3-${CONTAINER_ARCH}:latest

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY skirnir-container.nginx.conf /etc/nginx/http.d/skirnir.conf

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Skirnir
RUN mkdir -p /var/www/html/Skirnir-dist
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

