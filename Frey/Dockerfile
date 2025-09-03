ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-frontend-common-v3-${CONTAINER_ARCH}:latest

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY frey-container.nginx.conf /etc/nginx/http.d/frey.conf

# copy supervisor config
COPY supervisord.conf /etc/supervisord.conf

# Copy cron defs
COPY cron/tabs/nobody /var/spool/cron/crontabs/nobody

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Frey
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

