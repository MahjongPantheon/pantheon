#!/bin/sh
set -eu
# Shared clients are mounted by every application. Install them once, before
# service installs, rather than letting eleven pnpm processes change the tree.
cd /var/www/html/Common/tsclients
mkdir -p node_modules /.pnpm/cache/pnpm
chown user: node_modules /.pnpm /.pnpm/cache /.pnpm/cache/pnpm
exec su-exec user env HOME=/home/user CI=true XDG_CACHE_HOME=/.pnpm/cache pnpm install --frozen-lockfile \
  --prod=false --prefer-offline --reporter=append-only --store-dir /.pnpm
