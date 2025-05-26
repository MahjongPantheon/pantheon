FROM ghcr.io/mahjongpantheon/pantheon-frontend-common-v3-$BUILDARCH:latest

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY bragi-container.nginx.conf /etc/nginx/http.d/bragi.conf

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Bragi
RUN mkdir -p /var/www/html/Bragi-dist
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

