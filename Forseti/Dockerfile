ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# copy entry point
COPY --chmod=755 Forseti/entrypoint.sh /entrypoint.sh
# copy nginx configs
COPY Forseti/forseti-container.nginx.conf /etc/nginx/http.d/forseti.conf
# Folders init
RUN mkdir -p /var/www/html/Forseti
RUN mkdir -p /var/www/html/Forseti-dist

# Build artifacts in CI; retain source dependencies for migrations and scheduled jobs.
COPY Common /var/www/html/Common
COPY Forseti /var/www/html/Forseti
COPY --chmod=755 Common/ContainerRuntime/prepare.sh /prepare-service.sh
RUN --mount=type=cache,target=/root/.local/share/pnpm/store /bin/sh /var/www/html/Common/ContainerRuntime/build.sh Forseti
ENV PANTHEON_MODE=production
ENV PANTHEON_PRODUCTION_WORKERS=true
