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
    pnpm exec tsx watch --inspect=0.0.0.0:4212/debug src/server.ts
    ;;
  reload)
    supervisorctl restart meili:
    ;;
  build)
    mkdir -p dist
    pnpm exec tsx build.ts
    ;;
  prod-deps)
    ( cd ../Meili-dist && rm -rf node_modules && NODE_ENV=production pnpm install --prod --frozen-lockfile )
    ;;
  prebuild)
    mkdir -p ../Meili-dist
    cp -f dist/server.js ../Meili-dist/
    mkdir -p ../Meili-dist/bin
    cp -f bin/GeoLite2-City.mmdb ../Meili-dist/bin/
    cp -f package.json ../Meili-dist/
    cp -f pnpm-workspace.yaml ../Meili-dist/
    cp -f pnpm-lock.yaml ../Meili-dist/
    ;;
  test)
    pnpm test
    ;;
  test-verbose)
    pnpm test --reporter=verbose
    ;;
  help) echo "Meili tasks: dev reload build prod-deps prebuild test test-verbose $common_tasks" ;;
  *) common_task "$action" "$@" ;;
esac
