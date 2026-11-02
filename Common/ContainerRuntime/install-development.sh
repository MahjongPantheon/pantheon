#!/bin/sh
set -eu
service=$1
cd "/var/www/html/$service"
store=${npm_config_store_dir:-/.pnpm}
cache="$store/cache"
mkdir -p node_modules "$store" "$cache/pnpm"
chown user: node_modules "$store" "$cache" "$cache/pnpm"
echo "$service: installing development dependencies"
su-exec user node /var/www/html/Common/ContainerRuntime/refresh-development-client.mjs
# Keep package contents and registry policy metadata across container recreation.
# Only tsclients is invalidated; --force would reinstall every dependency.
su-exec user env HOME=/home/user CI=true XDG_CACHE_HOME="$cache" pnpm install --frozen-lockfile \
  --prod=false --prefer-offline --reporter=append-only --store-dir "$store"
