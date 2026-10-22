FROM alpine:3.22.0

# PostgreSQL runtime plus initialization, compression and remote-backup tools.
RUN apk add --no-cache bash ca-certificates curl git make openssh postgresql16 su-exec tzdata zstd
ENV TIMEZONE=Europe/Berlin
ENV LANG=en_US.utf8
RUN cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && \
    echo "${TIMEZONE}" > /etc/timezone
RUN mkdir -p /home/user /etc/profile.d

ENV PGDATA=/var/lib/postgresql/data
ENV POSTGRES_PASSWORD=pgpass

# copy entry point
COPY --chmod=755 entrypoint.sh /entrypoint.sh

# copy db init scripts
RUN mkdir -p /container-entrypoint-initdb.d
COPY dbinit_mimir2.sql /container-entrypoint-initdb.d/dbinit_mimir2.sql
COPY dbinit_frey2.sql /container-entrypoint-initdb.d/dbinit_frey2.sql
COPY dbinit_hugin.sql /container-entrypoint-initdb.d/dbinit_hugin.sql
COPY mimir_privileges.sql /container-entrypoint-initdb.d/mimir_privileges.sql
COPY create_frey2_db.sh /create_frey2_db.sh
COPY create_mimir2_db.sh /create_mimir2_db.sh
COPY ensure_mimir_migrations_privileges.sh /ensure_mimir_migrations_privileges.sh
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
RUN echo "    email = pantheon_backup@pantheon.local" >> /var/lib/postgresql/.gitconfig
RUN echo "    name = Pantheon Backup" >> /var/lib/postgresql/.gitconfig
COPY err_mailer.sh /var/lib/postgresql/err_mailer.sh

# Entry point
CMD ["/entrypoint.sh"]
