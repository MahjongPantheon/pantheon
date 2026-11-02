#!/bin/sh
set -eu
service=$1
cd "/var/www/html/$service"
/bin/sh /var/www/html/Common/ContainerRuntime/install-development.sh "$service"
case "$service" in
  Frey|Mimir|Hugin)
    node /var/www/html/Common/ContainerRuntime/wait-db.mjs "$service"
    case "$service" in
      Frey) su-exec user pnpm exec tsx app/database/migrate.ts ;;
      Mimir) su-exec user bash /var/www/html/Mimir/tasks.sh migrate ;;
      Hugin) su-exec user pnpm exec tsx src/migrate.ts ;;
    esac
    ;;
esac
mkdir -p /etc/supervisor.d
if [ "${PANTHEON_DEV_WATCH:-false}" = true ]; then
  cat > /etc/supervisor.d/development.conf <<EOF
[program:development]
command = su-exec user bash /var/www/html/$service/tasks.sh dev
directory = /var/www/html/$service
environment = HOME="/home/user"
autostart = true
autorestart = unexpected
startsecs = 2
stopasgroup = true
killasgroup = true
stdout_logfile = /dev/stdout
stderr_logfile = /dev/stderr
stdout_logfile_maxbytes = 0
stderr_logfile_maxbytes = 0
EOF
else
  rm -f /etc/supervisor.d/development.conf
fi
