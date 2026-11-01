ARG CONTAINER_ARCH=amd64
ARG BASE_TAG=latest
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:${BASE_TAG} AS development

COPY --chmod=755 Meili/entrypoint.sh /entrypoint.sh
COPY Meili/supervisord.conf /etc/supervisord.conf
COPY Meili/meili-container.nginx.conf /etc/nginx/http.d/meili.conf
RUN mkdir -p /var/www/html/Meili /var/www/html/Meili-dist

# Build artifacts in CI; install runtime dependencies into volumes at startup.
COPY Common /var/www/html/Common
COPY Meili /var/www/html/Meili
COPY --chmod=755 Common/ContainerRuntime/prepare.sh /prepare-service.sh
ENV PANTHEON_MODE=development
ENV PANTHEON_PRODUCTION_WORKERS=false
ENV PANTHEON_DEV_WATCH=false
RUN mkdir -p /etc/supervisor.d && printf '\n[include]\nfiles = /etc/supervisor.d/*.conf\n' >> /etc/supervisord.conf

FROM development AS production
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    --mount=type=cache,target=/root/.cache/pnpm \
    /bin/sh /var/www/html/Common/ContainerRuntime/build.sh Meili
ENV PANTHEON_MODE=production
ENV PANTHEON_PRODUCTION_WORKERS=true
