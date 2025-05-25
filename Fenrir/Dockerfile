FROM ubuntu:24.04

ENV TIMEZONE=Europe/Berlin
ENV PHP_MEMORY_LIMIT=512M
ENV LANG=en_US.utf8

SHELL ["/bin/bash", "-c"]

RUN apt-get update
RUN apt-get install -y tzdata
RUN echo "${TIMEZONE}" > /etc/timezone
RUN apt-get install -y \
    curl \
    make \
    procps \
    dos2unix \
    net-tools \
    findutils \
    git \
    nginx && \
    (rm "/tmp/"* 2>/dev/null || true)

RUN curl -sL https://deb.nodesource.com/setup_20.x | bash ;\
     apt-get update; \
     apt-get install -y nodejs

RUN npm install -g yarn && chown -R root:root /usr/lib/node_modules/

RUN npm install -g @testiny/cli

# Cleaning up
RUN mkdir /www && \
    apt-get remove -y tzdata && \
    rm -rf /var/lib/apt/lists/*

RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

ENV RUN_IN_DOCKER=true

RUN mkdir /root/dummy && \
    cd /root/dummy && \
    npm init -y && \
    yarn add @playwright/test && \
    yarn run playwright install --with-deps

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY fenrir-container.nginx.conf /etc/nginx/http.d/fenrir.conf

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Fenrir
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

