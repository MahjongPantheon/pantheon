#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
case "${1:-help}" in
  lint) ./protolint ./proto ;;
  autofix) ./protolint -fix ./proto ;;
  prod-deps) cd tsclients; rm -rf node_modules; pnpm install ;;
  help) echo 'Common tasks: lint autofix prod-deps' ;;
  *) echo "Unknown Common task: $1" >&2; exit 1 ;;
esac
