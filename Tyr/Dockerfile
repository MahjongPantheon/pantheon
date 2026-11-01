ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

# copy entry point
COPY --chmod=755 Tyr/entrypoint.sh /entrypoint.sh
# copy nginx configs
COPY Tyr/tyr-container.nginx.conf /etc/nginx/http.d/tyr.conf
# Folders init
RUN mkdir -p /var/www/html/Tyr
RUN mkdir -p /var/www/html/Tyr-dist

# Build artifacts in CI; install runtime dependencies into volumes at startup.
COPY Common /var/www/html/Common
COPY Tyr /var/www/html/Tyr
COPY --chmod=755 Common/ContainerRuntime/prepare.sh /prepare-service.sh
RUN --mount=type=cache,target=/root/.local/share/pnpm/store /bin/sh /var/www/html/Common/ContainerRuntime/build.sh Tyr
ENV PANTHEON_MODE=production
ENV PANTHEON_PRODUCTION_WORKERS=true
