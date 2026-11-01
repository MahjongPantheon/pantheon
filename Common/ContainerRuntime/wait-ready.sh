#!/bin/sh
set -eu
runtime=${CONTAINER_COMMAND:-docker}
applications='tyr forseti sigrun bragi frey mimir hugin gullveig meili hermod skirnir'
services=''
for service in $applications; do
  services="$services $service.pantheon.internal"
done
# Include output already emitted since Compose started the containers detached.
"$@" logs --follow --tail=100 $services &
logs_pid=$!
# Docker's CLI can spawn a Compose plugin that keeps the console open after the
# CLI exits. Stop descendants as well; these processes only read container logs.
stop_logs() {
  for log_child in $(ps -eo pid=,ppid= | awk -v parent="$1" '$2 == parent { print $1 }'); do
    stop_logs "$log_child" KILL
  done
  kill -"$2" "$1" 2>/dev/null || true
}
cleanup() {
  stop_logs "$logs_pid" TERM
  wait "$logs_pid" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
while :; do
  waiting=''
  for service in $applications; do
    id=$("$@" ps --all -q "$service.pantheon.internal")
    if [ -z "$id" ]; then
      echo "$service: production container is missing" >&2; exit 1
    fi
    # CONTAINER_COMMAND follows the root Makefile convention: executable plus arguments.
    status=$($runtime inspect --format '{{.State.Status}}:{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$id")
    case "$status" in
      running:healthy) ;;
      running:starting|running:unhealthy)
        phase=$("$@" exec -T "$service.pantheon.internal" node /var/www/html/Common/ContainerRuntime/startup-status.mjs "$service") || {
          echo "$service: startup status is unavailable; inspect logs or rebuild with make prod_local_build" >&2
          exit 1
        }
        case "$phase" in
          failed)
            echo "$service: dependency installation, migration or supervised service failed; inspect production Compose logs" >&2
            "$@" exec -T "$service.pantheon.internal" supervisorctl status >&2 || true
            exit 1 ;;
          preparing|starting|ready) ;;
          *) echo "$service: invalid startup status: $phase" >&2; exit 1 ;;
        esac
        waiting="$waiting $service"
        ;;
      *:missing) echo "$service: image has no production healthcheck; rebuild with make prod_local_build" >&2; exit 1 ;;
      *) echo "$service: container startup failed ($status); inspect production Compose logs" >&2; exit 1 ;;
    esac
  done
  if [ -z "$waiting" ]; then
    echo 'All production applications are healthy (dependencies installed, migrations complete, supervised services running, workers listening).'
    exit 0
  fi
  sleep 2
done
