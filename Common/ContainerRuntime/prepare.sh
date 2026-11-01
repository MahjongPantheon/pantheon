#!/bin/sh
set -eu
service=$1
case "${PANTHEON_MODE:-development}" in
  development) exit 0 ;;
  production) export NODE_ENV=production ;;
  *) echo 'PANTHEON_MODE must be development or production' >&2; exit 1 ;;
esac

ready=/run/pantheon-ready
failed=/run/pantheon-startup-failed
rm -f "$ready" "$failed"
trap 'result=$?; if [ "$result" -ne 0 ]; then echo "$result" > "$failed"; fi' EXIT
/bin/sh /var/www/html/Common/ContainerRuntime/install-dependencies.sh "$service"
node /var/www/html/Common/ContainerRuntime/configure.mjs "$service"
case "$service" in
  Frey|Mimir|Hugin)
    node /var/www/html/Common/ContainerRuntime/wait-db.mjs "$service"
    cd "/var/www/html/$service"
    case "$service" in
      Frey) su-exec user pnpm exec tsx app/database/migrate.ts ;;
      Mimir) su-exec user pnpm exec mikro-orm migration:up --config src/mikro-orm.config.ts ;;
      Hugin) cd ../Hugin-dist; su-exec user node migrate.js ;;
    esac
    ;;
esac
touch "$ready"
trap - EXIT
