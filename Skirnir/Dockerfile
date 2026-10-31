ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# copy entry point
COPY --chmod=755 Skirnir/entrypoint.sh /entrypoint.sh
# copy supervisor config
COPY Skirnir/supervisord.conf /etc/supervisord.conf
# copy nginx configs
COPY Skirnir/skirnir-container.nginx.conf /etc/nginx/http.d/skirnir.conf
# Folders init
RUN mkdir -p /var/www/html/Skirnir
RUN mkdir -p /var/www/html/Skirnir-dist

# Build artifacts in CI; retain source dependencies for migrations and scheduled jobs.
COPY Common /var/www/html/Common
COPY Skirnir /var/www/html/Skirnir
COPY --chmod=755 Common/ContainerRuntime/prepare.sh /prepare-service.sh
RUN --mount=type=cache,target=/root/.local/share/pnpm/store /bin/sh /var/www/html/Common/ContainerRuntime/build.sh Skirnir
ENV PANTHEON_MODE=production
ENV PANTHEON_PRODUCTION_WORKERS=true
