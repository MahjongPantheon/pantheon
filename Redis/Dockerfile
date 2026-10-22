FROM alpine:3.22.0

RUN apk add --no-cache redis su-exec tzdata
ENV TIMEZONE=Europe/Berlin
RUN cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && \
    echo "${TIMEZONE}" > /etc/timezone && \
    mkdir -p /home/user /etc/profile.d

# copy entry point
COPY --chmod=755 entrypoint.sh /entrypoint.sh

RUN mkdir -p /var/lib/redis && chown redis /var/lib/redis

RUN sed -i "s|bind 127.0.0.1 -::1|# bind 127.0.0.1 -::1|g" /etc/redis.conf
RUN sed -i "s|protected-mode yes|protected-mode no|g" /etc/redis.conf
RUN echo "user redis on allkeys allchannels allcommands -DEBUG ~* >redispass" >> /etc/redis.conf

# Entry point
CMD ["/entrypoint.sh"]

