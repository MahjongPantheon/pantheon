ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# copy entry point
COPY --chmod=755 Mimir/entrypoint.sh /entrypoint.sh
# copy nginx configs
COPY Mimir/mimir-container.nginx.conf /etc/nginx/http.d/mimir.conf
# copy supervisor config
COPY Mimir/supervisord.conf /etc/supervisord.conf
# Folders init
RUN mkdir -p /var/www/html/Mimir
RUN mkdir -p /var/www/html/Mimir-dist

# Build artifacts in CI; retain source dependencies for migrations and scheduled jobs.
COPY Common /var/www/html/Common
COPY Mimir /var/www/html/Mimir
COPY --chmod=755 Common/ContainerRuntime/prepare.sh /prepare-service.sh
RUN --mount=type=cache,target=/root/.local/share/pnpm/store /bin/sh /var/www/html/Common/ContainerRuntime/build.sh Mimir
ENV PANTHEON_MODE=production
ENV PANTHEON_PRODUCTION_WORKERS=true
