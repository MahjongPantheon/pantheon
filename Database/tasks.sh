#!/usr/bin/env bash
# Runs inside the database container. Access through bin/pantheon db or backup.
set -euo pipefail
cd /var/lib/postgresql
case "${1:-help}" in
  export)
    su-exec postgres mkdir -p export
    su-exec postgres pg_dump --clean -Z0 -Fd frey2 -f export/frey2
    su-exec postgres pg_dump --clean -Z0 -Fd mimir2 -f export/mimir2
    su-exec postgres tar czf export.tar.gz export
    su-exec postgres rm -rf export
    ;;
  import)
    su-exec postgres mkdir -p export
    su-exec postgres tar xf export.tar.gz
    su-exec postgres pg_restore -d frey2 --clean export/frey2
    su-exec postgres pg_restore -d mimir2 --clean export/mimir2
    su-exec postgres rm -rf export export.tar.gz
    ;;
  restore)
    commit=${2:?Backup commit required}
    cd backup
    # Read the two selected dumps without moving the backup checkout's branch.
    commit=$(git rev-parse --verify --end-of-options "$commit^{commit}")
    restore=$(mktemp -d ../restore.XXXXXX)
    trap 'rm -rf -- "$restore"' EXIT
    git archive "$commit" frey2 mimir2 | tar -x -C "$restore"
    pg_restore -d frey2 --clean "$restore/frey2"
    pg_restore -d mimir2 --clean "$restore/mimir2"
    ;;
  help) echo 'Database tasks: export import restore COMMIT' ;;
  *) echo "Unknown database task: $1" >&2; exit 1 ;;
esac
