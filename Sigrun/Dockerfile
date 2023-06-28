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
    procps \
    gettext \
    gettext-dev \
    git \
    icu-data-full \
    nginx \
    munin-node \
    nodejs \
    npm \
    protoc && \
    (rm "/tmp/"* 2>/dev/null || true) && (rm -rf /var/cache/apk/* 2>/dev/null || true)

RUN npm install -g i18n-stex i18n-po-json i18n-json-po yarn pm2 && chown -R root:root /usr/local/lib/node_modules/

# ------------ Local user init (for make & build tasks) --------
# Create user (workaround against too big uids)
RUN echo "user:x:${LOCAL_USER_ID:9001}:${LOCAL_USER_ID:9001}::/home/user:" >> /etc/passwd
## thanks for http://stackoverflow.com/a/1094354/535203 to compute the creation date
RUN echo "user:!:$(($(date +%s) / 60 / 60 / 24)):0:99999:7:::" >> /etc/shadow
RUN echo "user:x:${LOCAL_USER_ID:9001}:" >> /etc/group
RUN mkdir /home/user && chown user: /home/user

# Munin setup
RUN sed -i '/^allow/d' /etc/munin/munin-node.conf
RUN echo 'allow ^.*$' >>/etc/munin/munin-node.conf
RUN echo "host_name sigrun" >> /etc/munin/munin-node.conf

COPY munin_plugins/00-default /etc/munin/plugin-conf.d/00-default
COPY munin_plugins/cpubyuser /etc/munin/plugins
COPY munin_plugins/membyuser /etc/munin/plugins
RUN chmod +x /etc/munin/plugins/cpubyuser
RUN chmod +x /etc/munin/plugins/membyuser

RUN ln -s /usr/lib/munin/plugins/processes /etc/munin/plugins/processes && \
  ln -s /usr/lib/munin/plugins/proc_pri /etc/munin/plugins/proc_pri && \
  ln -s /usr/lib/munin/plugins/threads /etc/munin/plugins/threads && \
  ln -s /usr/lib/munin/plugins/vmstat /etc/munin/plugins/vmstat

# Cleaning up
RUN mkdir /www && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY sigrun-docker.nginx.conf /etc/nginx/http.d/sigrun.conf

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Sigrun
RUN mkdir -p /var/www/html/Sigrun-dist
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

