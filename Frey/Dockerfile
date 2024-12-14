FROM ghcr.io/mahjongpantheon/pantheon-backend-common:latest

# these should match auth data in dbinit_frey.sql
ENV PHINX_DB_FREY_NAME frey
ENV PHINX_DB_FREY_NAME_UNIT frey_unit
ENV PHINX_DB_FREY_USER frey
ENV PHINX_DB_FREY_PASS pgpass

ENV PHP_IDE_CONFIG serverName=pantheon_frey

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY frey-docker.nginx.conf /etc/nginx/http.d/frey.conf

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Frey
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

