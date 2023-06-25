#!/bin/sh

export HOME=/home/user

# -l 0 for verbosity
crond -b -l 8 -L /tmp/cronlogs
munin-node

if [ ! -f "/var/lib/postgresql/.ssh/id_rsa.pub" ]; then
  su-exec postgres ssh-keygen -q -N "" -f /var/lib/postgresql/.ssh/id_rsa -t rsa
  su-exec postgres echo "StrictHostKeyChecking no" > /var/lib/postgresql/.ssh/config
fi
if [ ! -d "/var/lib/postgresql/backup/.git" ]; then
  cd /var/lib/postgresql/backup && su-exec postgres git init -b main
  if [ -z "$BACKUP_GIT_REMOTE" ]; then
    cd /var/lib/postgresql/backup && su-exec postgres git remote add origin "$BACKUP_GIT_REMOTE"
    cd /var/lib/postgresql/backup && su-exec postgres git branch -M main
  fi
fi

# ------------ Pgsql init --------------------------------------
chown -R postgres "$PGDATA"

if [ -z "$(ls -A "$PGDATA")" ]; then
    su-exec postgres initdb
    sed -ri "s/^#(listen_addresses\s*=\s*)\S+/\1'*'/" "$PGDATA"/postgresql.conf

    : ${POSTGRES_USER:="postgres"}
    : ${POSTGRES_DB:=$POSTGRES_USER}

    if [ "$POSTGRES_PASSWORD" ]; then
      pass="PASSWORD '$POSTGRES_PASSWORD'"
      authMethod=md5
    else
      echo "==============================="
      echo "!!! Use \$POSTGRES_PASSWORD env var to secure your database !!!"
      echo "==============================="
      pass=
      authMethod=trust
    fi
    echo

    if [ "$POSTGRES_DB" != 'postgres' ]; then
      createSql="CREATE DATABASE $POSTGRES_DB;"
      echo $createSql | su-exec postgres postgres --single -jE
      echo
    fi

    if [ "$POSTGRES_USER" != 'postgres' ]; then
      op=CREATE
    else
      op=ALTER
    fi

    userSql="$op USER $POSTGRES_USER WITH SUPERUSER $pass;"
    echo $userSql | su-exec postgres postgres --single -jE
    echo

    # internal start of server in order to allow set-up using psql-client
    # does not listen on TCP/IP and waits until start finishes
    su-exec postgres pg_ctl -D "$PGDATA" \
        -o "-c listen_addresses=''" \
        -w start

    echo
    for f in /docker-entrypoint-initdb.d/*; do
        case "$f" in
            *.sh)  echo "$0: running $f"; . "$f" ;;
            *.sql) echo "$0: running $f"; psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < "$f" && echo ;;
            *)     echo "$0: ignoring $f" ;;
        esac
        echo
    done

    su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop

    { echo; echo "host all all 0.0.0.0/0 $authMethod"; } >> "$PGDATA"/pg_hba.conf
    { echo; echo "port = 5432"; } >> "$PGDATA"/postgresql.conf
fi

echo 'Starting PostgreSQL':
su-exec postgres postgres -D "$PGDATA" -o "-c listen_addresses='*'"
