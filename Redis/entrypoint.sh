#!/bin/sh

export HOME=/home/user
echo "export PS1=\"|\033[1;31m Redis container \033[0m~> \$PWD (\\u) \\$ \"" > /etc/profile.d/external.sh

echo 'Starting Redis':
su-exec redis redis-server /etc/redis.conf
