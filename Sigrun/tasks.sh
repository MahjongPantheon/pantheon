#!/usr/bin/env bash
# Owning service commands; normally invoked in a container by bin/pantheon.
set -euo pipefail
task_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
self="$task_directory/tasks.sh"
cd "$task_directory"
action=${1:-help}; if (( $# )); then shift; fi
source ../Common/ContainerRuntime/service-tasks.sh
case "$action" in
  test|test-verbose)
    if [[ $action == test-verbose ]]; then export TEST_VERBOSE=true; fi
    echo "======= Sigrun: test ======"
    ./node_modules/.bin/vitest --run "$@"
    ;;
  build)
    ./node_modules/.bin/tsc
    rm -rf ./node_modules/.vite
    ./node_modules/.bin/vite build --outDir dist/client
    ./node_modules/.bin/vite build --ssr app/server.tsx --outDir dist/server
    ./node_modules/.bin/vite build --ssr app/services/gameApi.ts --outDir dist/server --emptyOutDir false
    ;;
  prod-deps)
    ( cd ../Sigrun-dist && rm -rf node_modules && NODE_ENV=production pnpm install )
    ;;
  prebuild)
    cp pwa-192x192.png dist/client/
    cp pwa-512x512.png dist/client/
    ( cd dist/client/assets && gzip -k -9 -f *.js *.css )
    cp -R dist ../Sigrun-dist/
    cp -f server.js ../Sigrun-dist/
    if [ -f .env.production ]; then cp -f .env.production ../Sigrun-dist/ ; fi
    if [ -f .env.development ]; then cp -f .env.development ../Sigrun-dist/ ; fi
    cp -f package.json ../Sigrun-dist/
    cp -f pnpm-workspace.yaml ../Sigrun-dist/
    cp -f pnpm-lock.yaml ../Sigrun-dist/
    ;;
  cleanup-prebuilts)
    mkdir -p ../Sigrun-dist/dist/client/assets
    ( cd ../Sigrun-dist/dist/client/assets && find -name '*.js' -or -name '*.css' -or -name '*.js.gz' -or -name '*.css.gz' | tail -n +30 | xargs -I {} rm {} )
    ;;
  dev)
    ./node_modules/.bin/vite --clearScreen=false --force
    ;;
  i18n-extract)
    ./node_modules/.bin/stex -s 'app/**/*.?(ts|tsx)' -o app/i18n/messages.pot.json
    ./node_modules/.bin/jsonpo -s app/i18n/messages.pot.json -o app/i18n/messages.pot --printOccurences
    rm app/i18n/messages.pot.json
    msgmerge -s -U ./app/i18n/ru.po ./app/i18n/messages.pot --backup=none
    msgmerge -s -U ./app/i18n/ko.po ./app/i18n/messages.pot --backup=none
    msgmerge -s -U ./app/i18n/de.po ./app/i18n/messages.pot --backup=none
    msgmerge -s -U ./app/i18n/jp.po ./app/i18n/messages.pot --backup=none
    msgmerge -s -U ./app/i18n/cn.po ./app/i18n/messages.pot --backup=none
    msgmerge -s -U ./app/i18n/be.po ./app/i18n/messages.pot --backup=none
    ;;
  i18n-update)
    ./node_modules/.bin/pojson -s app/i18n/ru.po -o app/i18n/ru.json --withMeta
    ./node_modules/.bin/pojson -s app/i18n/be.po -o app/i18n/be.json --withMeta
    ./node_modules/.bin/pojson -s app/i18n/ko.po -o app/i18n/ko.json --withMeta
    ./node_modules/.bin/pojson -s app/i18n/de.po -o app/i18n/de.json --withMeta
    ./node_modules/.bin/pojson -s app/i18n/cn.po -o app/i18n/cn.json --withMeta
    ./node_modules/.bin/pojson -s app/i18n/jp.po -o app/i18n/jp.json --withMeta
    ;;
  reload)
    supervisorctl restart sigrun:
    ;;
  help) echo "Sigrun tasks: test build prod-deps prebuild cleanup-prebuilts dev i18n-extract i18n-update reload $common_tasks" ;;
  *) common_task "$action" "$@" ;;
esac
