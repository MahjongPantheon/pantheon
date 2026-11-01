ARG CONTAINER_ARCH=amd64
FROM ubuntu:22.04

ENV TIMEZONE=Europe/Berlin
ENV LANG=en_US.utf8
ENV RUN_IN_DOCKER=true

SHELL ["/bin/bash", "-c"]

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash

RUN apt-get update
RUN apt-get install -y \
    procps \
    dos2unix \
    net-tools \
    findutils \
    git \
    nginx \
    nodejs && \
    (rm "/tmp/"* 2>/dev/null || true)

RUN chown -R root:root /usr/lib/node_modules/

RUN npm install -g pnpm @testiny/cli

# Cleaning up
RUN rm -rf /var/lib/apt/lists/*

RUN mkdir /www

RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

RUN mkdir /root/dummy
RUN cd /root/dummy && \
    pnpm init && \
    pnpm install @playwright/test && \
    pnpm exec playwright install --with-deps

# copy entry point
COPY --chmod=755 entrypoint.sh /entrypoint.sh

# copy nginx configs
COPY fenrir-container.nginx.conf /etc/nginx/conf.d/fenrir.conf

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Fenrir
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]
