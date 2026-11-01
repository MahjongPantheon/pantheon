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
    echo "======= Bragi: test ======"
    ./node_modules/.bin/vitest --run "$@"
    ;;
  build)
    ./node_modules/.bin/tsc
    rm -rf ./node_modules/.vite
    ./node_modules/.bin/vite build --outDir dist/client
    ./node_modules/.bin/vite build --ssr app/server.tsx --outDir dist/server
    ;;
  prod-deps)
    ( cd ../Bragi-dist && rm -rf node_modules && NODE_ENV=production pnpm install )
    ;;
  prebuild)
    ( cd dist/client/assets && gzip -k -9 -f *.js *.css )
    cp -R dist ../Bragi-dist/
    cp -f server.js ../Bragi-dist/
    if [ -f .env.production ]; then cp -f .env.production ../Bragi-dist/ ; fi
    if [ -f .env.development ]; then cp -f .env.development ../Bragi-dist/ ; fi
    date +"%Y-%m-%d" > ../Bragi-dist/lastbuild.txt
    cp -f package.json ../Bragi-dist/
    cp -f pnpm-workspace.yaml ../Bragi-dist/
    cp -f pnpm-lock.yaml ../Bragi-dist/
    ;;
  cleanup-prebuilts)
    mkdir -p ../Bragi-dist/dist/client/assets
    ( cd ../Bragi-dist/dist/client/assets && find -name '*.js' -or -name '*.css' -or -name '*.js.gz' -or -name '*.css.gz' | tail -n +30 | xargs -I {} rm {} )
    ;;
  dev)
    ./node_modules/.bin/vite --clearScreen=false --force
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
    supervisorctl restart bragi:
    ;;
  help) echo "Bragi tasks: test build prod-deps prebuild cleanup-prebuilts dev i18n-extract i18n-update reload $common_tasks" ;;
  *) common_task "$action" "$@" ;;
esac
