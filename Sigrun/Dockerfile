FROM alpine:3.17

ENV TIMEZONE            Europe/Moscow
ENV PHP_MEMORY_LIMIT    512M
ENV LANG                en_US.utf8
ENV YARN_CACHE_FOLDER   /home/user/.yarn-cache
ENV COMPOSER_CACHE_DIR  /home/user/.composer-cache

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
    icu-data-full \
    nginx \
    nodejs \
    npm \
    protoc

RUN npm install -g i18n-stex i18n-po-json i18n-json-po yarn

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
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Expose ports
EXPOSE 4008 4108

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY sigrun-docker.nginx.conf /etc/nginx/http.d/sigrun.conf

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Sigrun
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]
