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
    procps \
    openssh \
    make \
    munin-node \
    git \
    postgresql13 && \
    (rm "/tmp/"* 2>/dev/null || true) && (rm -rf /var/cache/apk/* 2>/dev/null || true)

# ------------ Local user init (for make & build tasks) --------
# Create user (workaround against too big uids)
RUN echo "user:x:${LOCAL_USER_ID:9001}:${LOCAL_USER_ID:9001}::/home/user:" >> /etc/passwd
## thanks for http://stackoverflow.com/a/1094354/535203 to compute the creation date
RUN echo "user:!:$(($(date +%s) / 60 / 60 / 24)):0:99999:7:::" >> /etc/shadow
RUN echo "user:x:${LOCAL_USER_ID:9001}:" >> /etc/group
RUN mkdir /home/user && chown user: /home/user

# Munin setup
RUN sed -i '/^allow/d' /etc/munin/munin-node.conf
RUN echo 'allow ^.*$' >>/etc/munin/munin-node.conf
RUN echo "host_name db" >> /etc/munin/munin-node.conf

COPY munin_plugins/cpubyuser /etc/munin/plugins
COPY munin_plugins/membyuser /etc/munin/plugins
RUN chmod +x /etc/munin/plugins/cpubyuser
RUN chmod +x /etc/munin/plugins/membyuser

RUN ln -s /usr/lib/munin/plugins/cpu /etc/munin/plugins/cpu && \
  ln -s /usr/lib/munin/plugins/df /etc/munin/plugins/df && \
  ln -s /usr/lib/munin/plugins/df_inode /etc/munin/plugins/df_inode && \
  ln -s /usr/lib/munin/plugins/diskstats /etc/munin/plugins/diskstats && \
  ln -s /usr/lib/munin/plugins/forks /etc/munin/plugins/forks && \
  ln -s /usr/lib/munin/plugins/fw_conntrack /etc/munin/plugins/fw_conntrack && \
  ln -s /usr/lib/munin/plugins/fw_forwarded_local /etc/munin/plugins/fw_forwarded_local && \
  ln -s /usr/lib/munin/plugins/fw_packets /etc/munin/plugins/fw_packets && \
  ln -s /usr/lib/munin/plugins/interrupts /etc/munin/plugins/interrupts && \
  ln -s /usr/lib/munin/plugins/iostat /etc/munin/plugins/iostat && \
  ln -s /usr/lib/munin/plugins/load /etc/munin/plugins/load && \
  ln -s /usr/lib/munin/plugins/memory /etc/munin/plugins/memory && \
  ln -s /usr/lib/munin/plugins/netstat /etc/munin/plugins/netstat && \
  ln -s /usr/lib/munin/plugins/open_files /etc/munin/plugins/open_files && \
  ln -s /usr/lib/munin/plugins/open_inodes /etc/munin/plugins/open_inodes && \
  ln -s /usr/lib/munin/plugins/postgres_autovacuum /etc/munin/plugins/postgres_autovacuum && \
  ln -s /usr/lib/munin/plugins/postgres_bgwriter /etc/munin/plugins/postgres_bgwriter && \
  ln -s /usr/lib/munin/plugins/postgres_cache_ /etc/munin/plugins/postgres_cache_mimir && \
  ln -s /usr/lib/munin/plugins/postgres_cache_ /etc/munin/plugins/postgres_cache_frey && \
  ln -s /usr/lib/munin/plugins/postgres_cache_ /etc/munin/plugins/postgres_cache_hugin && \
  ln -s /usr/lib/munin/plugins/postgres_checkpoints /etc/munin/plugins/postgres_checkpoints && \
  ln -s /usr/lib/munin/plugins/postgres_connections_ /etc/munin/plugins/postgres_connections_mimir && \
  ln -s /usr/lib/munin/plugins/postgres_connections_ /etc/munin/plugins/postgres_connections_frey && \
  ln -s /usr/lib/munin/plugins/postgres_connections_ /etc/munin/plugins/postgres_connections_hugin && \
  ln -s /usr/lib/munin/plugins/postgres_connections_db /etc/munin/plugins/postgres_connections_db && \
  ln -s /usr/lib/munin/plugins/postgres_locks_ /etc/munin/plugins/postgres_locks_mimir && \
  ln -s /usr/lib/munin/plugins/postgres_locks_ /etc/munin/plugins/postgres_locks_frey && \
  ln -s /usr/lib/munin/plugins/postgres_locks_ /etc/munin/plugins/postgres_locks_hugin && \
  ln -s /usr/lib/munin/plugins/postgres_querylength_ /etc/munin/plugins/postgres_querylength_mimir && \
  ln -s /usr/lib/munin/plugins/postgres_querylength_ /etc/munin/plugins/postgres_querylength_frey && \
  ln -s /usr/lib/munin/plugins/postgres_querylength_ /etc/munin/plugins/postgres_querylength_hugin && \
  ln -s /usr/lib/munin/plugins/postgres_scans_ /etc/munin/plugins/postgres_scans_mimir && \
  ln -s /usr/lib/munin/plugins/postgres_scans_ /etc/munin/plugins/postgres_scans_frey && \
  ln -s /usr/lib/munin/plugins/postgres_scans_ /etc/munin/plugins/postgres_scans_hugin && \
  ln -s /usr/lib/munin/plugins/postgres_size_ /etc/munin/plugins/postgres_size_mimir && \
  ln -s /usr/lib/munin/plugins/postgres_size_ /etc/munin/plugins/postgres_size_frey && \
  ln -s /usr/lib/munin/plugins/postgres_size_ /etc/munin/plugins/postgres_size_hugin && \
  ln -s /usr/lib/munin/plugins/postgres_transactions_ /etc/munin/plugins/postgres_transactions_mimir && \
  ln -s /usr/lib/munin/plugins/postgres_transactions_ /etc/munin/plugins/postgres_transactions_frey && \
  ln -s /usr/lib/munin/plugins/postgres_transactions_ /etc/munin/plugins/postgres_transactions_hugin && \
  ln -s /usr/lib/munin/plugins/postgres_users /etc/munin/plugins/postgres_users && \
  ln -s /usr/lib/munin/plugins/postgres_xlog /etc/munin/plugins/postgres_xlog && \
  ln -s /usr/lib/munin/plugins/processes /etc/munin/plugins/processes && \
  ln -s /usr/lib/munin/plugins/proc_pri /etc/munin/plugins/proc_pri && \
  ln -s /usr/lib/munin/plugins/swap /etc/munin/plugins/swap && \
  ln -s /usr/lib/munin/plugins/threads /etc/munin/plugins/threads && \
  ln -s /usr/lib/munin/plugins/uptime /etc/munin/plugins/uptime && \
  ln -s /usr/lib/munin/plugins/vmstat /etc/munin/plugins/vmstat

# Cleaning up
RUN mkdir /www && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy db init scripts
RUN mkdir -p /docker-entrypoint-initdb.d
COPY dbinit.sql /docker-entrypoint-initdb.d/dbinit.sql
COPY dbinit_frey.sql /docker-entrypoint-initdb.d/dbinit_frey.sql
COPY dbinit_hugin.sql /docker-entrypoint-initdb.d/dbinit_hugin.sql
COPY Makefile /var/lib/postgresql/Makefile

# Copy cron defs
COPY cron/tabs/postgres /var/spool/cron/crontabs/postgres
COPY cron/backup.sh /var/lib/postgresql/backup.sh

# Folders init
RUN mkdir -p /run/postgresql && chown postgres /run/postgresql
RUN mkdir -p /var/lib/postgresql/.ssh && chown postgres /var/lib/postgresql/.ssh
RUN mkdir -p /var/lib/postgresql/backup && chown postgres /var/lib/postgresql/backup

# Git backups related
RUN echo "" > /var/lib/postgresql/.gitconfig
RUN echo "[user]" >> /var/lib/postgresql/.gitconfig
RUN echo "    email = pantheon_backup@riichimahjong.org" >> /var/lib/postgresql/.gitconfig
RUN echo "    name = Pantheon Backup" >> /var/lib/postgresql/.gitconfig

# Entry point
CMD ["/entrypoint.sh"]

