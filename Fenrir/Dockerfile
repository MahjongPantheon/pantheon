FROM ubuntu:22.04

ENV TIMEZONE=Europe/Berlin
ENV PHP_MEMORY_LIMIT=512M
ENV LANG=en_US.utf8
ENV RUN_IN_DOCKER=true

SHELL ["/bin/bash", "-c"]

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash

RUN apt-get update
RUN apt-get install -y \
    make \
    procps \
    dos2unix \
    net-tools \
    findutils \
    git \
    nginx \
    nodejs \
    pnpm && \
    (rm "/tmp/"* 2>/dev/null || true)

RUN chown -R root:root /usr/lib/node_modules/

RUN pnpm install -g @testiny/cli

# Cleaning up
RUN rm -rf /var/lib/apt/lists/*

RUN mkdir /www

RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

RUN mkdir /root/dummy
RUN cd /root/dummy && \
    pnpm init -y && \
    pnpm install @playwright/test && \
    pnpm run playwright install --with-deps

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

