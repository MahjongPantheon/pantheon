#!/bin/sh
set -eu
service=$1
root=${2:-/var/www/html}

install_dependencies() {
  cd "$root/$1"
  mkdir -p node_modules
  chown user: node_modules
  # Keep the package store in the dependency volume too. Force synchronization
  # refreshes local file: packages (Common/tsclients) when the image changes.
  su-exec user env HOME=/home/user CI=true pnpm install --frozen-lockfile \
    --force --store-dir node_modules/.pnpm-store "$2"
}

case "$service" in
  Tyr|Forseti) exit 0 ;; # Static bundles have no Node.js runtime.
  Frey|Mimir)
    # Source migrations and cron jobs require CLI tools from devDependencies.
    install_dependencies "$service" --prod=false
    ;;
esac
install_dependencies "$service-dist" --prod
