FROM alpine:3.17

RUN apk update && \
    apk upgrade && \
    apk add --update tzdata && \
    apk add --update \
    su-exec \
    curl \
    make \
    gettext \
    gettext-dev \
    git \
    icu-data-full \
    nginx \
    protoc \
    php81-apcu \
    php81-fpm \
    php81-ctype \
    php81-curl \
    php81-gettext \
    php81-gd \
    php81-gettext \
    php81-gmp \
    php81-iconv \
    php81-intl \
    php81-json \
    php81-mbstring \
    php81-openssl \
    php81-pdo_pgsql \
    php81-pdo \
    php81-pecl-ast \
    php81-pecl-protobuf \
    php81-pgsql \
    php81-phar \
    php81-phpdbg \
    php81-simplexml \
    php81-soap \
    php81-tokenizer \
    php81-xdebug \
    php81-xml \
    php81-xmlwriter \
    php81-xmlreader

ENV TIMEZONE            Europe/Moscow
ENV PHP_MEMORY_LIMIT    512M
ENV PHP_LOGFILE         /var/log/php-errors.log
ENV MAX_UPLOAD          50M
ENV PHP_MAX_FILE_UPLOAD 200
ENV PHP_MAX_POST        100M
ENV LANG                en_US.utf8

# Need to override this inside the container
ENV MIMIR_URL http://mimir
ENV FREY_URL  http://frey

ENV IS_DOCKER 1

# these should match auth data in dbinit_frey.sql
ENV PHINX_DB_FREY_NAME frey
ENV PHINX_DB_FREY_NAME_UNIT frey_unit
ENV PHINX_DB_FREY_USER frey
ENV PHINX_DB_FREY_PASS pgpass

ENV PHP_IDE_CONFIG serverName=pantheon_frey

RUN cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && \
    echo "${TIMEZONE}" > /etc/timezone

RUN touch $PHP_LOGFILE
RUN chown nobody $PHP_LOGFILE

# Set environments
RUN sed -i "s|;*daemonize\s*=\s*yes|daemonize = no|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*clear_env\s*=\s*no|clear_env = no|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.max_children\s*=\s*.*|pm.max_children = 20|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.start_servers\s*=\s*.*|pm.start_servers = 10|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.min_spare_servers\s*=\s*.*|pm.min_spare_servers = 5|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.max_spare_servers\s*=\s*.*|pm.max_spare_servers = 10|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*listen\s*=\s*127.0.0.1:9000|listen = 9000|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*listen\s*=\s*/||g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*date.timezone =.*|date.timezone = ${TIMEZONE}|i" /etc/php81/php.ini && \
    sed -i "s|;*memory_limit =.*|memory_limit = ${PHP_MEMORY_LIMIT}|i" /etc/php81/php.ini && \
    sed -i "s|;*error_log =.*|error_log = ${PHP_LOGFILE}|i" /etc/php81/php.ini && \
    sed -i "s|;*upload_max_filesize =.*|upload_max_filesize = ${MAX_UPLOAD}|i" /etc/php81/php.ini && \
    sed -i "s|;*max_file_uploads =.*|max_file_uploads = ${PHP_MAX_FILE_UPLOAD}|i" /etc/php81/php.ini && \
    sed -i "s|;*max_execution_time =.*|max_execution_time = 1000|i" /etc/php81/php.ini && \
    sed -i "s|;*post_max_size =.*|post_max_size = ${PHP_MAX_POST}|i" /etc/php81/php.ini && \
    sed -i "s|;*cgi.fix_pathinfo=.*|cgi.fix_pathinfo = 0|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.enable=.*|opcache.enable = 1|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.enable_cli=.*|opcache.enable_cli = 1|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.memory_consumption=.*|opcache.memory_consumption = 128|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.interned_strings_buffer=.*|opcache.interned_strings_buffer=8|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.max_accelerated_files=.*|opcache.max_accelerated_files=4000|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.fast_shutdown=.*|opcache.fast_shutdown=1|i" /etc/php81/php.ini
RUN if [[ -z "$NO_XDEBUG" ]] ; then echo -ne "zend_extension=xdebug.so\n \
          xdebug.mode=debug\n \
          xdebug.client_host=172.17.0.1\n \
          xdebug.client_port=9001\n" > /etc/php81/conf.d/50_xdebug.ini ; \
    fi

# ------------ Local user init (for make & build tasks) --------
# Create user (workaround against too big uids)
RUN echo "user:x:${LOCAL_USER_ID:9001}:${LOCAL_USER_ID:9001}::/home/user:" >> /etc/passwd
## thanks for http://stackoverflow.com/a/1094354/535203 to compute the creation date
RUN echo "user:!:$(($(date +%s) / 60 / 60 / 24)):0:99999:7:::" >> /etc/shadow
RUN echo "user:x:${LOCAL_USER_ID:9001}:" >> /etc/group
RUN mkdir /home/user && chown user: /home/user

# Cleaning up
RUN mkdir /www && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log \
    && ln -sf /dev/stderr /var/log/php81/error.log

# Expose ports
EXPOSE 4004

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY frey-docker.nginx.conf /etc/nginx/http.d/frey.conf

# Copy protoc plugins
COPY bin/protoc-gen-twirp_php /usr/bin/protoc-gen-twirp_php
RUN chmod +x /usr/bin/protoc-gen-twirp_php

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Frey
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

