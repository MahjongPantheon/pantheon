#!/usr/bin/env bash
# Owning service commands; normally invoked in a container by bin/pantheon.
set -euo pipefail
task_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
self="$task_directory/tasks.sh"
cd "$task_directory"
action=${1:-help}; if (( $# )); then shift; fi
source ../Common/ContainerRuntime/service-tasks.sh
case "$action" in
  test)
    ./node_modules/.bin/vitest --run
    ;;
  build)
    ./node_modules/.bin/tsc --outDir dist
    ;;
  prod-deps)
    ( cd ../Skirnir-dist && rm -rf node_modules && NODE_ENV=production pnpm install )
    ;;
  prebuild)
    cp -R dist ../Skirnir-dist/
    cp dist/server.js ../Skirnir-dist/
    if [ -f .env.production ]; then cp -f .env.production ../Skirnir-dist/ ; fi
    if [ -f .env.development ]; then cp -f .env.development ../Skirnir-dist/ ; fi
    cp -f package.json ../Skirnir-dist/
    cp -f pnpm-workspace.yaml ../Skirnir-dist/
    cp -f pnpm-lock.yaml ../Skirnir-dist/
    ;;
  dev)
    ./node_modules/.bin/tsx watch app/server.ts
    ;;
  i18n-extract)
    ./node_modules/.bin/stex -s 'app/**/*.?(ts|tsx)' -o app/i18n/messages.pot.json
    ./node_modules/.bin/jsonpo -s app/i18n/messages.pot.json -o app/i18n/messages.pot --printOccurences
    rm app/i18n/messages.pot.json
    msgmerge -s -U ./app/i18n/ru.po ./app/i18n/messages.pot --backup=none
    ;;
  i18n-update)
    ./node_modules/.bin/pojson -s app/i18n/ru.po -o app/i18n/ru.json --withMeta
    ;;
  reload)
    supervisorctl restart skirnir
    ;;
  help) echo "Skirnir tasks: test build prod-deps prebuild dev i18n-extract i18n-update reload $common_tasks" ;;
  *) common_task "$action" "$@" ;;
esac
