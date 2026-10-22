ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-frontend-common-v3-${CONTAINER_ARCH}:latest

COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh && chmod 755 /entrypoint.sh
COPY supervisord.conf /etc/supervisord.conf
COPY gullveig-container.nginx.conf /etc/nginx/http.d/gullveig.conf
RUN mkdir -p /run/nginx /var/www/html/Gullveig /var/www/html/Gullveig-dist

CMD ["/entrypoint.sh"]
