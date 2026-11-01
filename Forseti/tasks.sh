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
    echo "======= Forseti: test ======"
    ./node_modules/.bin/vitest --run "$@"
    ;;
  build)
    ./node_modules/.bin/tsc
    rm -rf ./node_modules/.vite
    ./node_modules/.bin/vite build --outDir dist
    ;;
  cleanup-prebuilts)
    ( cd ../Forseti-dist && find -name '*.js' -or -name '*.css' -or -name '*.js.gz' -or -name '*.css.gz' | tail -n +30 | xargs -I {} rm {} )
    ;;
  prebuild)
    ( cd dist/assets && gzip -k -9 -f *.js *.css )
    cp -R dist/. ../Forseti-dist/
    cp pwa-192x192.png pwa-512x512.png ../Forseti-dist/
    ;;
  dev)
    ./node_modules/.bin/vite --clearScreen=false --force
    ;;
  i18n-extract)
    ./node_modules/.bin/stex -s 'app/**/*.?(ts|tsx)' -o app/i18n/messages.pot.json
    ./node_modules/.bin/jsonpo -s app/i18n/messages.pot.json -o app/i18n/messages.pot --printOccurences
    rm app/i18n/messages.pot.json
    msgmerge -s -U ./app/i18n/ru.po ./app/i18n/messages.pot --backup=none
    msgmerge -s -U ./app/i18n/de.po ./app/i18n/messages.pot --backup=none
    msgmerge -s -U ./app/i18n/ko.po ./app/i18n/messages.pot --backup=none
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
  help) echo "Forseti tasks: test build cleanup-prebuilts prebuild dev i18n-extract i18n-update $common_tasks" ;;
  *) common_task "$action" "$@" ;;
esac
