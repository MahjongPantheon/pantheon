#!/usr/bin/env bash
# Owning service commands; normally invoked in a container by bin/pantheon.
set -euo pipefail
task_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
self="$task_directory/tasks.sh"
cd "$task_directory"
action=${1:-help}; if (( $# )); then shift; fi
source ../Common/ContainerRuntime/service-tasks.sh
case "$action" in
  migrate)
    pnpm exec mikro-orm migration:up
    ;;
  test)
    export TEST=true
    bash "$self" seed-test-db
    bash "$self" build
    echo "======= Mimir: test ======"
    node src/tests/production.mjs
    node src/tests/coverage.mjs
    # Debug Vitest: pnpm exec vitest run --inspect=0.0.0.0:4501 --no-file-parallelism
    ;;
  test-verbose)
    export TEST=true
    export TEST_VERBOSE=true
    bash "$self" seed-test-db
    echo "======= Mimir: test ======"
    pnpm exec vitest run
    ;;
  run-test-server)
    export TEST=true
    export TEST_VERBOSE=true
    echo "Running test server on port 4401"
    echo "Use node inspector in your browser (chrome://inspect or similar) to connect to the test server"
    echo "Use 'bin/pantheon task Mimir test-noserver' in separate terminal to run vitest on already started server"
    pnpm exec tsx watch --inspect=0.0.0.0:4401/debug src/tests/testserver.ts
    ;;
  test-noserver)
    export TEST=true
    export NO_SERVER=true
    echo "======= Mimir: test_noserver ======"
    pnpm exec vitest run
    ;;
  dev)
    pnpm exec tsx watch --inspect=0.0.0.0:4201/debug src/server.ts
    ;;
  init-test-db)
    DB_MIMIR_NAME=mimir2_unit pnpm exec mikro-orm schema:drop --run --drop-migrations-table
    DB_MIMIR_NAME=mimir2_unit pnpm exec mikro-orm migration:up
    ;;
  bootstrap-admin)
    pnpm exec tsx src/database/bootstrap_admin.ts
    ;;
  seed-test-db)
    export TEST=true
    bash "$self" clean-test-db
    bash "$self" migrate
    pnpm exec mikro-orm seeder:run --class=TestSeeder
    ;;
  clean-test-db)
    export TEST=true
    pnpm exec mikro-orm schema:drop --run --drop-migrations-table
    ;;
  reload)
    supervisorctl restart mimir:
    ;;
  build)
    mkdir -p dist
    pnpm exec tsx build.ts
    ;;
  prod-deps)
    ( cd ../Mimir-dist && rm -rf node_modules && NODE_ENV=production pnpm install )
    ;;
  common-deps)
    ( cd ../Common/tsclients && NODE_ENV=production pnpm install )
    ;;
  prebuild)
    cp -f dist/server.js ../Mimir-dist/
    cp -f dist/metadata.json ../Mimir-dist/
    if [ -f .env.production ]; then cp -f .env.production ../Mimir-dist/ ; fi
    cp -f package.json ../Mimir-dist/
    cp -f pnpm-workspace.yaml ../Mimir-dist/
    cp -f pnpm-lock.yaml ../Mimir-dist/
    ;;
  proto-gen)
    pnpm exec twirpscript
    ;;
  confirm-seed)
    pnpm exec tsx src/development/seed.ts confirm
    ;;
  migrate-mimir1)
    pnpm exec mikro-orm schema:drop --run --drop-migrations-table
    bash "$self" migrate
    time pnpm exec tsx src/migrate_from_mimir1.ts
    ;;
  seed|seed-tournament|seed-bigevent)
    pnpm exec tsx src/development/seed.ts "${action//-/_}"
    ;;
  help) echo "Mimir tasks: migrate test test-verbose run-test-server test-noserver dev init-test-db bootstrap-admin seed-test-db clean-test-db reload build prod-deps common-deps prebuild proto-gen confirm-seed migrate-mimir1 seed seed-tournament seed-bigevent $common_tasks" ;;
  *) common_task "$action" "$@" ;;
esac
