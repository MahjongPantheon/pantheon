#!/bin/sh
set -eu
service=$1
cd "/var/www/html/$service"
mkdir -p node_modules
chown user: node_modules
echo "$service: installing development dependencies"
# Refresh local file: packages while preferring cached registry metadata.
su-exec user env HOME=/home/user CI=true pnpm install --frozen-lockfile \
  --prod=false --force --prefer-offline --reporter=append-only --store-dir "${npm_config_store_dir:-/.pnpm}"
