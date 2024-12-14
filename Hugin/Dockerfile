FROM ghcr.io/mahjongpantheon/pantheon-backend-common:latest

# these should match auth data in dbinit_hugin.sql
ENV PHINX_DB_HUGIN_NAME hugin
ENV PHINX_DB_HUGIN_NAME_UNIT hugin_unit
ENV PHINX_DB_HUGIN_USER hugin
ENV PHINX_DB_HUGIN_PASS pgpass
ENV PHP_IDE_CONFIG serverName=pantheon_hugin

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY hugin-docker.nginx.conf /etc/nginx/http.d/hugin.conf

# Copy cron defs
COPY cron/tabs/nobody /var/spool/cron/crontabs/nobody

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Hugin
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

