#!/bin/sh
set -eu

export HOME=/home/user
echo "export PS1=\"|\033[1;31m Sigrun container \033[0m~> \$PWD (\\u) \\$ \"" > /etc/profile.d/external.sh

if [ "${PANTHEON_MODE:-development}" = production ]; then
  export NODE_ENV=production
fi
/prepare-service.sh Sigrun

exec supervisord -c /etc/supervisord.conf
