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
    pnpm exec tsx watch --inspect=0.0.0.0:4207/debug src/server.ts
    ;;
  reload)
    supervisorctl restart hermod
    ;;
  build)
    mkdir -p dist
    pnpm exec tsx build.ts
    ;;
  prod-deps)
    ( cd ../Hermod-dist && rm -rf node_modules && NODE_ENV=production pnpm install --prod --frozen-lockfile )
    ;;
  prebuild)
    mkdir -p ../Hermod-dist
    cp -f dist/server.js dist/dump-mail.js ../Hermod-dist/
    cp -f package.json ../Hermod-dist/
    cp -f pnpm-workspace.yaml ../Hermod-dist/
    cp -f pnpm-lock.yaml ../Hermod-dist/
    ;;
  test)
    pnpm test
    ;;
  test-verbose)
    pnpm test --reporter=verbose
    ;;
  last-mail)
    pnpm exec tsx src/dump-mail.ts
    ;;
  help) echo "Hermod tasks: dev reload build prod-deps prebuild test test-verbose last-mail $common_tasks" ;;
  *) common_task "$action" "$@" ;;
esac
