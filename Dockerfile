FROM alpine:3.5

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

# these should match auth data in dbinit.sql
ENV PHINX_DB_NAME mimir
ENV PHINX_DB_NAME_UNIT mimir_unit
ENV PHINX_DB_USER mimir
ENV PHINX_DB_PASS pgpass
ENV PHINX_DB_PORT $DB_PORT

RUN apk update && \
    apk upgrade && \
    apk add --update tzdata && \
    cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && \
    echo "${TIMEZONE}" > /etc/timezone && \
    apk add --update \
    curl \
    make \
    gettext \
    git \
    nginx \
    postgresql \
    nodejs \
    php5-mcrypt \
    php5-soap \
    php5-gettext \
    php5-intl \
    php5-openssl \
    php5-gmp \
    php5-phar \
    php5-json \
    php5-pdo \
    php5-pdo_pgsql \
    php5-pgsql \
    php5-gd \
    php5-gettext \
    php5-xmlreader \
    php5-xmlrpc \
    php5-iconv \
    php5-curl \
    php5-ctype \
    php5-fpm \
    php5-apcu

RUN curl -o /usr/local/bin/gosu -sSL "https://github.com/tianon/gosu/releases/download/1.2/gosu-amd64" && \
    chmod +x /usr/local/bin/gosu

RUN npm install -g xgettext-template i18n-stex i18n-po-json i18n-json-po yarn
RUN touch $PHP_LOGFILE
RUN chown nobody $PHP_LOGFILE
    
    # Set environments
RUN sed -i "s|;*daemonize\s*=\s*yes|daemonize = no|g" /etc/php5/php-fpm.conf && \
    sed -i "s|;*clear_env\s*=\s*no|clear_env = no|g" /etc/php5/php-fpm.conf && \
    sed -i "s|;*listen\s*=\s*127.0.0.1:9000|listen = 9000|g" /etc/php5/php-fpm.conf && \
    sed -i "s|;*listen\s*=\s*/||g" /etc/php5/php-fpm.conf && \
    sed -i "s|;*date.timezone =.*|date.timezone = ${TIMEZONE}|i" /etc/php5/php.ini && \
    sed -i "s|;*memory_limit =.*|memory_limit = ${PHP_MEMORY_LIMIT}|i" /etc/php5/php.ini && \
    sed -i "s|;*error_log =.*|error_log = ${PHP_LOGFILE}|i" /etc/php5/php.ini && \
    sed -i "s|;*upload_max_filesize =.*|upload_max_filesize = ${MAX_UPLOAD}|i" /etc/php5/php.ini && \
    sed -i "s|;*max_file_uploads =.*|max_file_uploads = ${PHP_MAX_FILE_UPLOAD}|i" /etc/php5/php.ini && \
    sed -i "s|;*post_max_size =.*|post_max_size = ${PHP_MAX_POST}|i" /etc/php5/php.ini && \
    sed -i "s|;*cgi.fix_pathinfo=.*|cgi.fix_pathinfo = 0|i" /etc/php5/php.ini && \
    sed -i "s|;*opcache.enable=.*|opcache.enable = 1|i" /etc/php5/php.ini && \
    sed -i "s|;*opcache.enable_cli=.*|opcache.enable_cli = 1|i" /etc/php5/php.ini && \
    sed -i "s|;*opcache.memory_consumption=.*|opcache.memory_consumption = 128|i" /etc/php5/php.ini && \
    sed -i "s|;*opcache.interned_strings_buffer=.*|opcache.interned_strings_buffer=8|i" /etc/php5/php.ini && \
    sed -i "s|;*opcache.max_accelerated_files=.*|opcache.max_accelerated_files=4000|i" /etc/php5/php.ini && \
    sed -i "s|;*opcache.fast_shutdown=.*|opcache.fast_shutdown=1|i" /etc/php5/php.ini

    # Cleaning up
RUN mkdir /www && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log \
    && ln -sf /dev/stderr /var/log/php7.1-fpm.log

# Expose ports
EXPOSE 4001 4002 4003 $DB_PORT

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY Rheda/rheda-docker.nginx.conf /etc/nginx/conf.d/rheda.conf
COPY Mimir/mimir-docker.nginx.conf /etc/nginx/conf.d/mimir.conf

# copy db init script
RUN mkdir -p /docker-entrypoint-initdb.d
COPY dbinit.sql /docker-entrypoint-initdb.d/dbinit.sql

# Folders init
RUN mkdir -p /run/postgresql && chown postgres /run/postgresql
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Tyr
RUN mkdir -p /var/www/html/Mimir
RUN mkdir -p /var/www/html/Rheda

# Entry point
CMD ["/entrypoint.sh"]

