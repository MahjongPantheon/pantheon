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
    echo "======= Frey: test ======"
    node app/tests/coverage.cjs
    ;;
  test-verbose)
    export TEST_VERBOSE=true
    echo "======= Frey: test ======"
    pnpm exec vitest run
    ;;
  run-test-server)
    export TEST_VERBOSE=true
    echo "Running test server on port 4404"
    echo "Use node inspector in your browser (chrome://inspect or similar) to connect to the test server"
    echo "Use 'bin/pantheon task Frey test-noserver' in separate terminal to run vitest on already started server"
    pnpm exec tsx watch --inspect=0.0.0.0:4404/debug app/tests/testserver.ts
    ;;
  test-noserver)
    export DEBUG=true
    echo "======= Frey: test_noserver ======"
    pnpm exec vitest run
    ;;
  dev)
    pnpm exec tsx watch --inspect=0.0.0.0:4204/debug app/server.ts
    ;;
  init-test-db)
    DB_FREY_NAME=frey2_unit pnpm exec tsx app/database/migrate.ts
    ;;
  bootstrap-admin)
    pnpm exec tsx app/database/bootstrap_admin.ts
    ;;
  clean-test-db)
    pnpm exec tsx app/database/clean_test_db.ts
    ;;
  reload)
    supervisorctl restart frey:
    ;;
  build)
    mkdir -p dist
    pnpm exec tsx build.ts
    ;;
  prod-deps)
    ( cd ../Frey-dist && rm -rf node_modules )
    ( cd ../Frey-dist && NODE_ENV=production pnpm install )
    ( cd ../Common/tsclients && rm -rf node_modules && pnpm install )
    ;;
  prebuild)
    cp -f dist/server.js ../Frey-dist/
    if [ -f .env.production ]; then cp -f .env.production ../Frey-dist/ ; fi
    cp -f package.json ../Frey-dist/
    cp -f pnpm-workspace.yaml ../Frey-dist/
    cp -f pnpm-lock.yaml ../Frey-dist/
    ;;
  proto-gen)
    pnpm exec twirpscript
    ( cd ../Common/tsclients && pnpm run build )
    ;;
  migrate)
    pnpm exec tsx app/database/migrate.ts
    ;;
  migrate-frey1)
    bash "$self" migrate
    pnpm exec tsx app/database/migrate_from_frey1.ts
    ;;
  dump-users)
    cat /tmp/dump_users.txt
    ;;
  help) echo "Frey tasks: test test-verbose run-test-server test-noserver dev init-test-db bootstrap-admin clean-test-db reload build prod-deps prebuild proto-gen migrate migrate-frey1 dump-users $common_tasks" ;;
  *) common_task "$action" "$@" ;;
esac
