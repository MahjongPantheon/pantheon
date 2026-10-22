ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-frontend-common-v3-${CONTAINER_ARCH}:latest

COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh && chmod 755 /entrypoint.sh
COPY supervisord.conf /etc/supervisord.conf
COPY meili-container.nginx.conf /etc/nginx/http.d/meili.conf
RUN mkdir -p /run/nginx /var/www/html/Meili /var/www/html/Meili-dist

CMD ["/entrypoint.sh"]
