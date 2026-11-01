ARG CONTAINER_ARCH=amd64
ARG BASE_TAG=latest
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:${BASE_TAG} AS development

# these should match auth data in dbinit_hugin.sql
ENV PHINX_DB_HUGIN_NAME=hugin
ENV PHINX_DB_HUGIN_NAME_UNIT=hugin_unit
ENV PHINX_DB_HUGIN_USER=hugin
ENV PHINX_DB_HUGIN_PASS=pgpass
ENV TZ=UTC
RUN apk add --no-cache rsyslog

# copy entry point
COPY --chmod=755 Hugin/entrypoint.sh /entrypoint.sh
# copy supervisor config
COPY Hugin/supervisord.conf /etc/supervisord.conf
# copy nginx configs
COPY Hugin/hugin-container.nginx.conf /etc/nginx/http.d/hugin.conf
# Copy cron defs
COPY Hugin/cron/tabs/user /var/spool/cron/crontabs/user
COPY Hugin/config/install_prometheus.sh /install_prometheus.sh
COPY Hugin/config/prometheus_partial_config.conf /prometheus_partial_config.conf
RUN bash /install_prometheus.sh

# Folders init
RUN mkdir -p /var/www/html/Hugin /var/www/html/Hugin-dist

# Build artifacts in CI; install runtime dependencies into volumes at startup.
COPY Common /var/www/html/Common
COPY Hugin /var/www/html/Hugin
COPY --chmod=755 Common/ContainerRuntime/prepare.sh /prepare-service.sh
ENV PANTHEON_MODE=development
ENV PANTHEON_PRODUCTION_WORKERS=false
ENV PANTHEON_DEV_WATCH=false
RUN mkdir -p /etc/supervisor.d && printf '\n[include]\nfiles = /etc/supervisor.d/*.conf\n' >> /etc/supervisord.conf

FROM development AS production
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/root/.cache/pnpm \
    /bin/sh /var/www/html/Common/ContainerRuntime/build.sh Hugin
ENV PANTHEON_MODE=production
ENV PANTHEON_PRODUCTION_WORKERS=true
