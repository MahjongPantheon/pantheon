FROM ghcr.io/mahjongpantheon/pantheon-backend-common-v2:latest

ENV PHP_IDE_CONFIG="serverName=pantheon_gullveig"
ENV MAX_UPLOAD=1M
RUN sed -i "s|;*upload_max_filesize =.*|upload_max_filesize = ${MAX_UPLOAD}|i" /etc/php83/php.ini

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY gullveig-docker.nginx.conf /etc/nginx/http.d/gullveig.conf

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Gullveig
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

