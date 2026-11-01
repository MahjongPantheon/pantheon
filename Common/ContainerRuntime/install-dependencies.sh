#!/bin/sh
set -eu
service=$1
root=${2:-/var/www/html}
case "$service" in
  Tyr|Forseti) exit 0 ;; # Static bundles have no Node.js runtime.
esac
store=${npm_config_store_dir:-/.pnpm/store}
cache="$(dirname "$store")/cache"
mkdir -p "$store" "$cache/pnpm"
chown user: "$store" "$cache" "$cache/pnpm"

install_dependencies() {
  cd "$root/$1"
  mkdir -p node_modules
  chown user: node_modules
  echo "$1: installing dependencies"
  su-exec user env HOME=/home/user CI=true XDG_CACHE_HOME="$cache" pnpm install --frozen-lockfile \
    --reporter=append-only --force --store-dir "$store" "$2"
  # Keep installed packages in .pnpm; only remove legacy caches after success.
  rm -rf node_modules/.pnpm-store
  echo "$1: dependencies installed"
}

case "$service" in
  Frey|Mimir)
    # Source migrations and cron jobs require CLI tools from devDependencies.
    install_dependencies "$service" --prod=false
    ;;
esac
install_dependencies "$service-dist" --prod
