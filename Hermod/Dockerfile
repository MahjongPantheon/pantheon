ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

RUN apk add --no-cache postfix rsyslog opendkim opendkim-utils ca-certificates

COPY       Hermod/configs/supervisord.conf     /etc/supervisord.conf
COPY       Hermod/configs/rsyslog*.conf        /etc/
COPY       Hermod/configs/opendkim.conf        /etc/opendkim/opendkim.conf
COPY       Hermod/configs/smtp_header_checks   /etc/postfix/smtp_header_checks
COPY       Hermod/scripts/*.sh                 /

# copy nginx configs
COPY Hermod/hermod-container.nginx.conf /etc/nginx/http.d/hermod.conf
RUN        chmod +x /run.sh /opendkim.sh

USER       root
WORKDIR    /tmp

# Folders init
RUN mkdir -p /etc/opendkim/keys
RUN mkdir -p /var/www/html/Hermod /var/www/html/Hermod-dist

EXPOSE     587 25
CMD        ["/bin/sh", "-c", "/run.sh"]

# Build artifacts in CI; install runtime dependencies into volumes at startup.
COPY Common /var/www/html/Common
COPY Hermod /var/www/html/Hermod
COPY --chmod=755 Common/ContainerRuntime/prepare.sh /prepare-service.sh
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/root/.cache/pnpm \
    /bin/sh /var/www/html/Common/ContainerRuntime/build.sh Hermod
ENV PANTHEON_MODE=production
ENV PANTHEON_PRODUCTION_WORKERS=true
