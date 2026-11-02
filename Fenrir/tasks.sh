#!/usr/bin/env bash
# Owning service commands; normally invoked in a container by bin/pantheon.
set -euo pipefail
task_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
self="$task_directory/tasks.sh"
cd "$task_directory"
action=${1:-help}; if (( $# )); then shift; fi
source ../Common/ContainerRuntime/service-tasks.sh
case "$action" in
  deps)
    pnpm install --frozen-lockfile
    pnpm exec playwright install --with-deps
    ;;
  dev-deps)
    pnpm install --no-frozen-lockfile
    pnpm exec playwright install --with-deps
    ;;
  run)
    CI=true ./node_modules/.bin/playwright test "$@"
    ;;
  ui-proxy)
    cp fenrir-container.nginx.conf /etc/nginx/conf.d/fenrir.conf
    nginx -t
    nginx -s reload
    ;;
  ui)
    bash "$self" ui-proxy
    echo 'Open Playwright UI at http://localhost:4011 (Ctrl+C to stop).'
    env -u CI ./node_modules/.bin/playwright test --ui --ui-host=127.0.0.1 --ui-port=4017 --workers=1 --retries=0 "$@"
    ;;
  help) echo "Fenrir tasks: deps dev-deps run ui-proxy ui $common_tasks" ;;
  *) common_task "$action" "$@" ;;
esac
