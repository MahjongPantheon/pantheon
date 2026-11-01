ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# copy entry point
COPY --chmod=755 Frey/entrypoint.sh /entrypoint.sh
# copy nginx configs
COPY Frey/frey-container.nginx.conf /etc/nginx/http.d/frey.conf
# copy supervisor config
COPY Frey/supervisord.conf /etc/supervisord.conf
# Copy cron defs
COPY Frey/cron/tabs/nobody /var/spool/cron/crontabs/user
# Folders init
RUN mkdir -p /var/www/html/Frey

# Build artifacts in CI; install runtime dependencies into volumes at startup.
COPY Common /var/www/html/Common
COPY Frey /var/www/html/Frey
COPY --chmod=755 Common/ContainerRuntime/prepare.sh /prepare-service.sh
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/root/.cache/pnpm \
    /bin/sh /var/www/html/Common/ContainerRuntime/build.sh Frey
ENV PANTHEON_MODE=production
ENV PANTHEON_PRODUCTION_WORKERS=true
