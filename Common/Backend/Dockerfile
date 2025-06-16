FROM alpine:3.22.0

RUN apk update && \
    apk upgrade && \
    apk add --update tzdata && \
    apk add --update \
    su-exec \
    bash \
    curl \
    tar \
    make \
    memcached \
    font-dejavu-sans-mono-nerd \
    procps \
    protoc \
    gettext \
    gettext-dev \
    git \
    icu-data-full \
    nginx \
    postgresql16 \
    php83-fpm \
    php83-bcmath \
    php83-ctype \
    php83-curl \
    php83-gettext \
    php83-gd \
    php83-gettext \
    php83-gmp \
    php83-iconv \
    php83-intl \
    php83-json \
    php83-mbstring \
    php83-openssl \
    php83-pdo_pgsql \
    php83-pdo \
    php83-pecl-ast \
    php83-pecl-protobuf \
    php83-pecl-memcached \
    php-pecl-redis \
    php83-pgsql \
    php83-phar \
    php83-phpdbg \
    php83-simplexml \
    php83-soap \
    php83-tokenizer \
    php83-xdebug \
    php83-xml \
    php83-xmlwriter \
    php83-xmlreader \
    postfix \
    redis \
    opendkim \
    net-tools \
    findutils \
    openssh \
    ca-certificates \
    tzdata \
    supervisor \
    rsyslog \
    musl \
    musl-utils \
    opendkim-utils \
    mailx && \
    (rm "/tmp/"* 2>/dev/null || true) && (rm -rf /var/cache/apk/* 2>/dev/null || true)

ENV TIMEZONE="Europe/Berlin"
ENV PHP_MEMORY_LIMIT=512M
ENV PHP_LOGFILE=/var/log/php-errors.log
ENV MAX_UPLOAD=50M
ENV PHP_MAX_FILE_UPLOAD=200
ENV PHP_MAX_POST=100M
ENV LANG=en_US.utf8
ENV COMPOSER_CACHE_DIR=/home/user/.composer-cache

RUN cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && \
    echo "${TIMEZONE}" > /etc/timezone

RUN touch $PHP_LOGFILE
RUN chown nobody $PHP_LOGFILE

RUN chmod -R +r /etc/php83

# Set environments
RUN sed -i "s|;*daemonize\s*=\s*yes|daemonize = no|g" /etc/php83/php-fpm.d/www.conf && \
    sed -i "s|;*clear_env\s*=\s*no|clear_env = no|g" /etc/php83/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.max_children\s*=\s*.*|pm.max_children = 20|g" /etc/php83/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.start_servers\s*=\s*.*|pm.start_servers = 10|g" /etc/php83/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.min_spare_servers\s*=\s*.*|pm.min_spare_servers = 5|g" /etc/php83/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.max_spare_servers\s*=\s*.*|pm.max_spare_servers = 10|g" /etc/php83/php-fpm.d/www.conf && \
    sed -i "s|;*listen\s*=\s*localhost:9000|listen = 9000|g" /etc/php83/php-fpm.d/www.conf && \
    sed -i "s|;*listen\s*=\s*/||g" /etc/php83/php-fpm.d/www.conf && \
    sed -i "s|;*date.timezone =.*|date.timezone = ${TIMEZONE}|i" /etc/php83/php.ini && \
    sed -i "s|;*memory_limit =.*|memory_limit = ${PHP_MEMORY_LIMIT}|i" /etc/php83/php.ini && \
    sed -i "s|;*error_log =.*|error_log = ${PHP_LOGFILE}|i" /etc/php83/php.ini && \
    sed -i "s|;*upload_max_filesize =.*|upload_max_filesize = ${MAX_UPLOAD}|i" /etc/php83/php.ini && \
    sed -i "s|;*max_file_uploads =.*|max_file_uploads = ${PHP_MAX_FILE_UPLOAD}|i" /etc/php83/php.ini && \
    sed -i "s|;*max_execution_time =.*|max_execution_time = 1000|i" /etc/php83/php.ini && \
    sed -i "s|;*post_max_size =.*|post_max_size = ${PHP_MAX_POST}|i" /etc/php83/php.ini && \
    sed -i "s|;*cgi.fix_pathinfo=.*|cgi.fix_pathinfo = 0|i" /etc/php83/php.ini && \
    sed -i "s|;*opcache.enable=.*|opcache.enable = 1|i" /etc/php83/php.ini && \
    sed -i "s|;*opcache.enable_cli=.*|opcache.enable_cli = 1|i" /etc/php83/php.ini && \
    sed -i "s|;*opcache.memory_consumption=.*|opcache.memory_consumption = 128|i" /etc/php83/php.ini && \
    sed -i "s|;*opcache.interned_strings_buffer=.*|opcache.interned_strings_buffer=8|i" /etc/php83/php.ini && \
    sed -i "s|;*opcache.max_accelerated_files=.*|opcache.max_accelerated_files=4000|i" /etc/php83/php.ini && \
    sed -i "s|;*opcache.fast_shutdown=.*|opcache.fast_shutdown=1|i" /etc/php83/php.ini

# Cleaning up
RUN mkdir /www && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log \
    && ln -sf /dev/stderr /var/log/php83/error.log

# ------------ Local user init (for make & build tasks) --------
# Create user (workaround against too big uids)
RUN echo "user:x:${LOCAL_USER_ID:9001}:${LOCAL_USER_ID:9001}::/home/user:" >> /etc/passwd
## thanks for http://stackoverflow.com/a/1094354/535203 to compute the creation date
RUN echo "user:!:$(($(date +%s) / 60 / 60 / 24)):0:99999:7:::" >> /etc/shadow
RUN echo "user:x:${LOCAL_USER_ID:9001}:" >> /etc/group
RUN mkdir /home/user && chown user: /home/user

# Copy protoc plugins
COPY bin/protoc-gen-twirp_php /usr/bin/protoc-gen-twirp_php
RUN chmod +x /usr/bin/protoc-gen-twirp_php

