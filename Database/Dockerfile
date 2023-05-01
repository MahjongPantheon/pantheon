FROM alpine:3.17

ENV TIMEZONE            Europe/Moscow
ENV PHP_MEMORY_LIMIT    1024M
ENV LANG                en_US.utf8
ENV PGDATA              /var/lib/postgresql/data
ENV POSTGRES_PASSWORD   pgpass

RUN apk update && \
    apk upgrade && \
    apk add --update tzdata && \
    cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && \
    echo "${TIMEZONE}" > /etc/timezone && \
    apk add --update \
    su-exec \
    curl \
    make \
    git \
    postgresql13

# ------------ Local user init (for make & build tasks) --------
# Create user (workaround against too big uids)
RUN echo "user:x:${LOCAL_USER_ID:9001}:${LOCAL_USER_ID:9001}::/home/user:" >> /etc/passwd
## thanks for http://stackoverflow.com/a/1094354/535203 to compute the creation date
RUN echo "user:!:$(($(date +%s) / 60 / 60 / 24)):0:99999:7:::" >> /etc/shadow
RUN echo "user:x:${LOCAL_USER_ID:9001}:" >> /etc/group
RUN mkdir /home/user && chown user: /home/user

# Cleaning up
RUN mkdir /www && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

# Expose ports
EXPOSE 5532

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy db init scripts
RUN mkdir -p /docker-entrypoint-initdb.d
COPY dbinit.sql /docker-entrypoint-initdb.d/dbinit.sql
COPY dbinit_frey.sql /docker-entrypoint-initdb.d/dbinit_frey.sql

# Folders init
RUN mkdir -p /run/postgresql && chown postgres /run/postgresql

# Entry point
CMD ["/entrypoint.sh"]

