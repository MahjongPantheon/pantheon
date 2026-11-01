FROM alpine:3.24.3

ENV TIMEZONE=Europe/Berlin
ENV LANG=en_US.utf8

RUN apk update && \
    apk upgrade && \
    apk add --update tzdata && \
    cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && \
    echo "${TIMEZONE}" > /etc/timezone && \
    apk add --update \
    su-exec \
    bash \
    curl \
    tar \
    make \
    procps \
    net-tools \
    findutils \
    gettext \
    gettext-dev \
    git \
    icu-data-full \
    nginx \
    nodejs-current \
    npm \
    libstdc++ \
    libgcc \
    ca-certificates \
    supervisor \
    protoc && \
    (rm "/tmp/"* 2>/dev/null || true) && (rm -rf /var/cache/apk/* 2>/dev/null || true)

RUN --mount=type=cache,target=/root/.npm \
    node --version && npm install -g pnpm@12 i18n-stex i18n-po-json i18n-json-po && pnpm --version && chown -R root:root "$(npm root -g)"

# ------------ Local user init (for make & build tasks) --------
# Create user (workaround against too big uids)
RUN echo "user:x:${LOCAL_USER_ID:9001}:${LOCAL_USER_ID:9001}::/home/user:" >> /etc/passwd
## thanks for http://stackoverflow.com/a/1094354/535203 to compute the creation date
RUN echo "user:!:$(($(date +%s) / 60 / 60 / 24)):0:99999:7:::" >> /etc/shadow
RUN echo "user:x:${LOCAL_USER_ID:9001}:" >> /etc/group
RUN mkdir /home/user && chown user: /home/user

# Cleaning up
RUN mkdir -p /www /run/nginx /var/www/html/Common && \
    rm -rf /var/cache/apk/*

RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Services with an entrypoint.sh inherit the common launch command.
CMD ["/entrypoint.sh"]
