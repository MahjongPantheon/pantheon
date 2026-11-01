#!/bin/sh
set -eu
service=$1
cd /var/www/html/Common/tsclients
pnpm install --frozen-lockfile
cd "/var/www/html/$service"
# Build tools are needed even when the final worker uses NODE_ENV=production.
pnpm install --frozen-lockfile
mkdir -p "../$service-dist"
PANTHEON_IMAGE_BUILD=1 NODE_ENV=production make build
make prebuild
# Remove build dependencies in the same RUN layer that installed them. Runtime
# dependencies are installed into volumes by prepare.sh on every production start.
rm -rf "/var/www/html/$service/node_modules" /var/www/html/Common/tsclients/node_modules
# Source is retained for migration CLIs and cron jobs, which run as user.
chown -R user: "/var/www/html/$service" "/var/www/html/$service-dist"
