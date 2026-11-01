#!/usr/bin/env bash
# Owning service commands; normally invoked in a container by bin/pantheon.
set -euo pipefail
task_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
self="$task_directory/tasks.sh"
cd "$task_directory"
action=${1:-help}; if (( $# )); then shift; fi
source ../Common/ContainerRuntime/service-tasks.sh
case "$action" in
  dev)
    pnpm exec tsx watch --inspect=0.0.0.0:4208/debug src/server.ts
    ;;
  reload)
    supervisorctl restart hugin:
    ;;
  build)
    mkdir -p dist
    pnpm exec tsx build.ts
    ;;
  prod-deps)
    ( cd ../Hugin-dist && rm -rf node_modules && NODE_ENV=production pnpm install --prod --frozen-lockfile )
    ;;
  prebuild)
    mkdir -p ../Hugin-dist
    cp -f dist/server.js dist/jobs.js dist/migrate.js ../Hugin-dist/
    mkdir -p ../Hugin-dist/bin
    cp -f bin/GeoLite2-*.mmdb ../Hugin-dist/bin/
    cp -f package.json ../Hugin-dist/
    cp -f pnpm-workspace.yaml ../Hugin-dist/
    cp -f pnpm-lock.yaml ../Hugin-dist/
    ;;
  test)
    pnpm test
    ;;
  test-verbose)
    pnpm test --reporter=verbose
    ;;
  migrate)
    pnpm exec tsx src/migrate.ts
    ;;
  seed)
    pnpm exec tsx src/seed.ts
    ;;
  common-deps)
    ( cd ../Common/tsclients && pnpm install --frozen-lockfile )
    ;;
  help) echo "Hugin tasks: dev reload build prod-deps prebuild test test-verbose migrate seed common-deps $common_tasks" ;;
  *) common_task "$action" "$@" ;;
esac
