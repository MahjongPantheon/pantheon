#!/bin/bash
set -eu

export HOME=/home/user
echo "export PS1=\"|\033[1;31m Tyr container \033[0m~> \$PWD (\\u) \\$ \"" > /etc/profile.d/external.sh

if [ "${PANTHEON_MODE:-development}" = production ]; then
  export NODE_ENV=production
fi
/prepare-service.sh Tyr

# composer care
mkdir -p /home/user/.composer-cache
chown user /home/user/.composer-cache

echo 'Starting NGINX';
nginx -g "daemon off;"

