FROM --platform=linux/amd64 alpine:3.14

ENV TIMEZONE            Europe/Moscow
ENV PHP_MEMORY_LIMIT    512M
ENV PHP_LOGFILE         /var/log/php-errors.log
ENV MAX_UPLOAD          50M
ENV PHP_MAX_FILE_UPLOAD 200
ENV PHP_MAX_POST        100M
ENV LANG                en_US.utf8
ENV PGDATA              /var/lib/postgresql/data
ENV POSTGRES_PASSWORD   pgpass
ENV YARN_CACHE_FOLDER   /home/user/.yarn-cache
ENV COMPOSER_CACHE_DIR  /home/user/.composer-cache
ENV DB_PORT             5532

ENV MIMIR_URL http://localhost:4001
ENV RHEDA_URL http://localhost:4002
ENV TYR_URL   http://localhost:4003
ENV FREY_URL  http://localhost:4004
ENV RATATOSK_URL  http://localhost:4006

ENV IS_DOCKER 1

# these should match auth data in dbinit.sql
ENV PHINX_DB_NAME mimir
ENV PHINX_DB_NAME_UNIT mimir_unit
ENV PHINX_DB_USER mimir
ENV PHINX_DB_PASS pgpass
ENV PHINX_DB_PORT $DB_PORT

# these should match auth data in dbinit_frey.sql
ENV PHINX_DB_FREY_NAME frey
ENV PHINX_DB_FREY_NAME_UNIT frey_unit
ENV PHINX_DB_FREY_USER frey
ENV PHINX_DB_FREY_PASS pgpass
ENV PHINX_DB_FREY_PORT $DB_PORT

ENV PHP_IDE_CONFIG serverName=pantheon

RUN apk update && \
    apk upgrade && \
    apk add --update tzdata && \
    cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && \
    echo "${TIMEZONE}" > /etc/timezone && \
    apk add --update \
    su-exec \
    curl \
    make \
    gettext \
    gettext-dev \
    git \
    nginx \
    postgresql \
    nodejs \
    npm \
    php7-pecl-ast \
    php7-mcrypt \
    php7-soap \
    php7-gettext \
    php7-intl \
    php7-tokenizer \
    php7-mbstring \
    php7-simplexml \
    php7-openssl \
    php7-gmp \
    php7-phar \
    php7-json \
    php7-pdo \
    php7-pdo_pgsql \
    php7-pgsql \
    php7-gd \
    php7-gettext \
    php7-xmlreader \
    php7-xmlwriter \
    php7-xmlrpc \
    php7-xdebug \
    php7-phpdbg \
    php7-iconv \
    php7-curl \
    php7-ctype \
    php7-fpm \
    php7-apcu

RUN npm config set unsafe-perm true
RUN npm install -g xgettext-template i18n-stex i18n-po-json i18n-json-po yarn
RUN touch $PHP_LOGFILE
RUN chown nobody $PHP_LOGFILE

# Set environments
RUN sed -i "s|;*daemonize\s*=\s*yes|daemonize = no|g" /etc/php7/php-fpm.d/www.conf && \
    sed -i "s|;*clear_env\s*=\s*no|clear_env = no|g" /etc/php7/php-fpm.d/www.conf && \
    sed -i "s|;*listen\s*=\s*127.0.0.1:9000|listen = 9000|g" /etc/php7/php-fpm.d/www.conf && \
    sed -i "s|;*listen\s*=\s*/||g" /etc/php7/php-fpm.d/www.conf && \
    sed -i "s|;*date.timezone =.*|date.timezone = ${TIMEZONE}|i" /etc/php7/php.ini && \
    sed -i "s|;*memory_limit =.*|memory_limit = ${PHP_MEMORY_LIMIT}|i" /etc/php7/php.ini && \
    sed -i "s|;*error_log =.*|error_log = ${PHP_LOGFILE}|i" /etc/php7/php.ini && \
    sed -i "s|;*upload_max_filesize =.*|upload_max_filesize = ${MAX_UPLOAD}|i" /etc/php7/php.ini && \
    sed -i "s|;*max_file_uploads =.*|max_file_uploads = ${PHP_MAX_FILE_UPLOAD}|i" /etc/php7/php.ini && \
    sed -i "s|;*max_execution_time =.*|max_execution_time = 1000|i" /etc/php7/php.ini && \
    sed -i "s|;*post_max_size =.*|post_max_size = ${PHP_MAX_POST}|i" /etc/php7/php.ini && \
    sed -i "s|;*cgi.fix_pathinfo=.*|cgi.fix_pathinfo = 0|i" /etc/php7/php.ini && \
    sed -i "s|;*opcache.enable=.*|opcache.enable = 1|i" /etc/php7/php.ini && \
    sed -i "s|;*opcache.enable_cli=.*|opcache.enable_cli = 1|i" /etc/php7/php.ini && \
    sed -i "s|;*opcache.memory_consumption=.*|opcache.memory_consumption = 128|i" /etc/php7/php.ini && \
    sed -i "s|;*opcache.interned_strings_buffer=.*|opcache.interned_strings_buffer=8|i" /etc/php7/php.ini && \
    sed -i "s|;*opcache.max_accelerated_files=.*|opcache.max_accelerated_files=4000|i" /etc/php7/php.ini && \
    sed -i "s|;*opcache.fast_shutdown=.*|opcache.fast_shutdown=1|i" /etc/php7/php.ini
RUN if [[ -z "$NO_XDEBUG" ]] ; then echo -ne "zend_extension=xdebug.so\n \
          xdebug.mode=debug\n \
          xdebug.start_with_request=yes\n \
          xdebug.client_host=host.docker.internal\n \
          xdebug.client_port=9001\n" > /etc/php7/conf.d/50_xdebug.ini ; \
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
    && ln -sf /dev/stderr /var/log/php7/error.log

# Expose ports
EXPOSE 4001 4002 4003 4004 $DB_PORT

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY Rheda/rheda-docker.nginx.conf /etc/nginx/http.d/rheda.conf
COPY Mimir/mimir-docker.nginx.conf /etc/nginx/http.d/mimir.conf
COPY Frey/frey-docker.nginx.conf /etc/nginx/http.d/frey.conf
COPY Ratatosk/nginx/ratatosk-docker.nginx.conf /etc/nginx/http.d/ratatosk.conf

# copy db init scripts
RUN mkdir -p /docker-entrypoint-initdb.d
COPY dbinit.sql /docker-entrypoint-initdb.d/dbinit.sql
COPY dbinit_frey.sql /docker-entrypoint-initdb.d/dbinit_frey.sql

# Folders init
RUN mkdir -p /run/postgresql && chown postgres /run/postgresql
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Tyr
RUN mkdir -p /var/www/html/Mimir
RUN mkdir -p /var/www/html/Rheda
RUN mkdir -p /var/www/html/Frey
RUN mkdir -p /var/www/html/Common
RUN mkdir -p /var/www/html/Hermod
RUN mkdir -p /var/www/html/pantheon

# Entry point
CMD ["/entrypoint.sh"]

