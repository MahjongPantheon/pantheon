ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-backend-common-v3-${CONTAINER_ARCH}:latest

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

RUN mkdir -p /var/lib/redis && chown redis /var/lib/redis

RUN sed -i "s|bind 127.0.0.1 -::1|# bind 127.0.0.1 -::1|g" /etc/redis.conf
RUN sed -i "s|protected-mode yes|protected-mode no|g" /etc/redis.conf
RUN echo "user redis on allkeys allchannels allcommands -DEBUG ~* >redispass" >> /etc/redis.conf

# Entry point
CMD ["/entrypoint.sh"]

