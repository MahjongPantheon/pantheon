#!/usr/bin/env bash
set -euo pipefail
mkdir -p "${1:?Report directory required}"
{
  bin/pantheon compose ps --all || true
  ids=$(bin/pantheon compose ps --all -q) || ids=''
  if [[ -n $ids ]]; then
    # State includes OOMKilled and exit codes, without exposing container env.
    bin/pantheon runtime inspect --format '{{.Name}} {{json .State}}' $ids || true
  fi
  bin/pantheon compose logs --no-color --tail=200 || true
} 2>&1 | tee "$1/containers.log"
