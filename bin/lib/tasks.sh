# Host orchestration. Service commands run in containers through service_task.
test_services=(Tyr Frey Mimir Gullveig Meili Hermod Hugin Forseti Sigrun Bragi)
service_task() {
  local requested=$1; shift
  service_name "$requested"
  case "$service" in
    Database|Redis) fail 'Use db, backup, compose or exec for storage maintenance.' ;;
    Common) service_exec Frey env HOME=/home/user su-exec user bash /var/www/html/Common/tasks.sh "$@" ;;
    Fenrir) service_exec "$service" bash "$directory/tasks.sh" "$@" ;;
    *) service_exec "$service" env HOME=/home/user su-exec user bash "$directory/tasks.sh" "$@" ;;
  esac
}
select_services() {
  selected=()
  if (( $# == 0 )); then selected=("${applications[@]}"); return; fi
  local requested
  for requested in "$@"; do
    service_name "$requested"
    case "$service" in Database|Redis|Common) fail "No application checks for $service" ;; esac
    selected+=("$service")
  done
}
run_checks() {
  select_services "$@"
  local jobs=${LINT_JOBS:-2} failed=0 name action pid index
  [[ $jobs =~ ^[1-9][0-9]*$ ]] || fail 'LINT_JOBS must be a positive integer.'
  local pids=() names=()
  mkdir -p tmp
  # Batches bound memory use; every check runs even when another check fails.
  trap 'kill "${pids[@]}" 2>/dev/null || true; exit 130' INT TERM
  for name in "${selected[@]}"; do
    for action in oxlint oxfmt typecheck; do
      echo "Running ${name,,}_$action (tmp/${name,,}_$action.log)"
      "$root/bin/pantheon" task "$name" "$action" > "tmp/${name,,}_$action.log" 2>&1 &
      pids+=("$!"); names+=("${name,,}_$action")
      if (( ${#pids[@]} >= jobs )); then
        for index in "${!pids[@]}"; do
          if wait "${pids[$index]}"; then echo "Passed: ${names[$index]}"
          else failed=1; echo "Failed: ${names[$index]}" >&2; cat "tmp/${names[$index]}.log" >&2; fi
        done
        pids=(); names=()
      fi
    done
  done
  for index in "${!pids[@]}"; do
    if wait "${pids[$index]}"; then echo "Passed: ${names[$index]}"
    else failed=1; echo "Failed: ${names[$index]}" >&2; cat "tmp/${names[$index]}.log" >&2; fi
  done
  trap - INT TERM
  return "$failed"
}
run_tests() {
  local target=test name failed=0 supported
  if [[ ${1:-} == --verbose ]]; then target=test-verbose; shift; fi
  if (( $# )); then select_services "$@"; else selected=("${test_services[@]}"); fi
  # Validate the complete selection before starting any suite.
  for name in "${selected[@]}"; do
    supported=false
    for candidate in "${test_services[@]}"; do [[ $name != "$candidate" ]] || supported=true; done
    [[ $supported == true ]] || fail "$name has no unit suite; Fenrir uses e2e."
  done
  mkdir -p tmp
  for name in "${selected[@]}"; do
    echo "Running $name $target (tmp/${name,,}_test.log)"
    if "$root/bin/pantheon" task "$name" "$target" 2>&1 | tee "tmp/${name,,}_test.log"; then
      echo "Passed: $name"
    else
      failed=1; echo "Failed: $name" >&2
    fi
  done
  return "$failed"
}
refresh_dependencies() {
  local target=deps
  if [[ ${1:-} == --update ]]; then target=dev-deps; shift; fi
  select_services "$@"
  if [[ $target == deps ]]; then
    service_exec Frey /bin/sh /var/www/html/Common/ContainerRuntime/development-init.sh
  else
    service_exec Frey sh -ec 'cd ../Common/tsclients && HOME=/home/user su-exec user pnpm install --no-frozen-lockfile'
  fi
  local name
  for name in "${selected[@]}"; do
    if [[ $target == deps && $name != Fenrir ]]; then
      service_exec "$name" /bin/sh /var/www/html/Common/ContainerRuntime/install-development.sh "$name"
    else service_task "$name" "$target"; fi
  done
}
infra_test() {
  ensure_base
  local rendered mode arch
  rendered=$(mktemp -d)
  trap 'rm -rf -- "$rendered"' EXIT
  for mode in dev source image; do
    for arch in amd64 arm64; do
      ENV_FILENAME=.env.e2e CONTAINER_ARCH=$arch IMAGE_TAG=test-release COMPOSE_PROJECT_NAME=pantheon \
        SOURCE_RUNTIME_MODE=development SOURCE_NODE_ENV=development PANTHEON_PRODUCTION_WORKERS=false \
        PANTHEON_STACK_MODE=$mode PANTHEON_LOCAL=false PANTHEON_BUILD=false \
        compose --profile '*' config --format json > "$rendered/$mode-$arch.json"
    done
  done
  ENV_FILENAME=.env.e2e CONTAINER_ARCH=amd64 COMPOSE_PROJECT_NAME=pantheon PANTHEON_STACK_MODE=source \
    PANTHEON_LOCAL=false SOURCE_RUNTIME_MODE=production SOURCE_NODE_ENV=production PANTHEON_PRODUCTION_WORKERS=true \
    compose --profile '*' config --format json > "$rendered/source-production.json"
  ENV_FILENAME=.env.e2e CONTAINER_ARCH=amd64 COMPOSE_PROJECT_NAME=pantheon PANTHEON_STACK_MODE=image \
    PANTHEON_LOCAL=true PANTHEON_BUILD=true compose --profile '*' config --format json > "$rendered/local.json"
  for arch in amd64 arm64; do
    ( unset CONTAINER_ARCH
      "${provider[@]}" -f "docker-compose-$arch.yml" --env-file Env/.env.e2e config --images
    ) > "$rendered/compatibility-$arch.txt"
  done
  # Node and all other development tools stay inside the existing base image.
  "${runtime[@]}" run --rm --network none --workdir /workspace \
    -v "$root:/workspace:ro" -v "$rendered:/rendered:ro" \
    "ghcr.io/mahjongpantheon/pantheon-container-base-v4-$CONTAINER_ARCH:latest" \
    bash -ec 'node --test Common/ContainerRuntime/*.test.mjs; node bin/check-compose.mjs /rendered'
  rm -rf -- "$rendered"
  trap - EXIT
}
confirm() {
  local answer
  printf '%s\nContinue? (y/N) ' "$1" >&2
  read -r answer || return 1
  [[ $answer == y || $answer == Y ]]
}
database_command() {
  local action=${1:-help} path=${2:-$caller_directory/export.tar.gz}
  case "$action" in
    export)
      service_exec Database bash -s -- export < "$root/Database/tasks.sh"
      "$root/bin/pantheon" copy Database :/var/lib/postgresql/export.tar.gz "$path"
      service_exec Database su-exec postgres rm -f /var/lib/postgresql/export.tar.gz
      ;;
    import)
      confirm 'This replaces the Frey and Mimir databases from the export.' || return 1
      "$root/bin/pantheon" copy Database "$path" :/var/lib/postgresql/export.tar.gz
      service_exec Database bash -s -- import < "$root/Database/tasks.sh"
      ;;
    create-frey2|create-mimir2|ensure-mimir-migrations-privileges)
      if [[ $action == create-* ]]; then script="${action//-/_}_db"; else script=${action//-/_}; fi
      service_exec Database su-exec postgres bash "/$script.sh"
      ;;
    *) fail 'Usage: db {export [FILE]|import [FILE]|create-frey2|create-mimir2|ensure-mimir-migrations-privileges}' ;;
  esac
}
backup_command() {
  case "${1:-help}" in
    pubkey) service_exec Database cat /var/lib/postgresql/.ssh/id_rsa.pub ;;
    history) service_exec Database su-exec postgres git -C /var/lib/postgresql/backup log --oneline ;;
    restore)
      (( $# == 2 )) || fail 'Usage: backup restore COMMIT'
      confirm 'This replaces the Frey and Mimir databases from the selected backup.' || return 1
      service_exec Database su-exec postgres bash -s -- restore "$2" < "$root/Database/tasks.sh"
      ;;
    *) fail 'Usage: backup {pubkey|history|restore COMMIT}' ;;
  esac
}
maintenance_command() {
  case "${1:-help}" in
    reset)
      confirm 'This removes ALL containers and persistent data in the selected Pantheon project.' || return 1
      PANTHEON_LOCAL=true compose --profile '*' down --volumes --remove-orphans
      ;;
    migrate-frey1) service_task Frey migrate-frey1 ;;
    migrate-mimir1)
      confirm 'This removes the Mimir database contents and imports data from Mimir v1.' || return 1
      database_command ensure-mimir-migrations-privileges
      service_task Mimir migrate-mimir1
      ;;
    release-tag) git rev-parse --short HEAD > Common/ReleaseTag.txt ;;
    *) fail 'Usage: maintenance {reset|migrate-frey1|migrate-mimir1|release-tag}' ;;
  esac
}
