#!/bin/sh

export HOME=/home/user
echo "export PS1=\"|\033[1;31m Forseti container \033[0m~> \$PWD (\\u) \\$ \"" > /etc/profile.d/external.sh

# composer care
mkdir /home/user/.composer-cache
chown user /home/user/.composer-cache

echo 'Starting NGINX';
nginx -g "daemon off;"
