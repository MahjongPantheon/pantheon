#!/bin/sh
set -eu

export HOME=/home/user
echo "export PS1=\"|\033[1;31m Mimir container \033[0m~> \$PWD (\\u) \\$ \"" > /etc/profile.d/external.sh

if [ "${PANTHEON_MODE:-development}" = production ]; then
  export NODE_ENV=production
fi
/prepare-service.sh Mimir

# -l 0 for verbosity
crond -b -l 8 -L /tmp/cronlogs

exec supervisord -c /etc/supervisord.conf
