ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# copy entry point
COPY --chmod=755 Sigrun/entrypoint.sh /entrypoint.sh
# copy supervisor config
COPY Sigrun/supervisord.conf /etc/supervisord.conf
# copy nginx configs
COPY Sigrun/sigrun-container.nginx.conf /etc/nginx/http.d/sigrun.conf
# Folders init
RUN mkdir -p /var/www/html/Sigrun
RUN mkdir -p /var/www/html/Sigrun-dist

# Build artifacts in CI; install runtime dependencies into volumes at startup.
COPY Common /var/www/html/Common
COPY Sigrun /var/www/html/Sigrun
COPY --chmod=755 Common/ContainerRuntime/prepare.sh /prepare-service.sh
RUN --mount=type=cache,target=/root/.local/share/pnpm/store /bin/sh /var/www/html/Common/ContainerRuntime/build.sh Sigrun
ENV PANTHEON_MODE=production
ENV PANTHEON_PRODUCTION_WORKERS=true
