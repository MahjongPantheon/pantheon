ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

COPY --chmod=755 Gullveig/entrypoint.sh /entrypoint.sh
COPY Gullveig/supervisord.conf /etc/supervisord.conf
COPY Gullveig/gullveig-container.nginx.conf /etc/nginx/http.d/gullveig.conf
RUN mkdir -p /var/www/html/Gullveig /var/www/html/Gullveig-dist

# Build artifacts in CI; retain source dependencies for migrations and scheduled jobs.
COPY Common /var/www/html/Common
COPY Gullveig /var/www/html/Gullveig
COPY --chmod=755 Common/ContainerRuntime/prepare.sh /prepare-service.sh
RUN --mount=type=cache,target=/root/.local/share/pnpm/store /bin/sh /var/www/html/Common/ContainerRuntime/build.sh Gullveig
ENV PANTHEON_MODE=production
ENV PANTHEON_PRODUCTION_WORKERS=true
