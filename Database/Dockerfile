FROM ghcr.io/mahjongpantheon/pantheon-backend-common-v3-$CONTAINER_ARCH:latest

ENV PGDATA=/var/lib/postgresql/data
ENV POSTGRES_PASSWORD=pgpass

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy db init scripts
RUN mkdir -p /container-entrypoint-initdb.d
COPY dbinit.sql /container-entrypoint-initdb.d/dbinit.sql
COPY dbinit_frey.sql /container-entrypoint-initdb.d/dbinit_frey.sql
COPY dbinit_hugin.sql /container-entrypoint-initdb.d/dbinit_hugin.sql
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
COPY ErrMailer.php /var/lib/postgresql/ErrMailer.php

# Entry point
CMD ["/entrypoint.sh"]

