#!/bin/sh
set -eu

service_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
case "${PANTHEON_MODE:-development}" in
  production)
    cd "$service_dir-dist"
    exec node jobs.js "$@"
    ;;
  development)
    cd "$service_dir"
    exec pnpm exec tsx src/jobs.ts "$@"
    ;;
  *) echo 'PANTHEON_MODE must be development or production' >&2; exit 1 ;;
esac
