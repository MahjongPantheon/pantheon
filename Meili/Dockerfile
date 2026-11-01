ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

COPY --chmod=755 Meili/entrypoint.sh /entrypoint.sh
COPY Meili/supervisord.conf /etc/supervisord.conf
COPY Meili/meili-container.nginx.conf /etc/nginx/http.d/meili.conf
RUN mkdir -p /var/www/html/Meili /var/www/html/Meili-dist

# Build artifacts in CI; install runtime dependencies into volumes at startup.
COPY Common /var/www/html/Common
COPY Meili /var/www/html/Meili
COPY --chmod=755 Common/ContainerRuntime/prepare.sh /prepare-service.sh
RUN --mount=type=cache,target=/root/.local/share/pnpm/store /bin/sh /var/www/html/Common/ContainerRuntime/build.sh Meili
ENV PANTHEON_MODE=production
ENV PANTHEON_PRODUCTION_WORKERS=true
