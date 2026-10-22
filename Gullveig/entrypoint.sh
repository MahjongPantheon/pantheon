#!/bin/sh

export HOME=/home/user
echo "export PS1=\"|\033[1;31m Gullveig container \033[0m~> \$PWD (\\u) \\$ \"" > /etc/profile.d/external.sh

mkdir -p /var/storage/files/avatars
chown user: /var/storage/files/avatars

exec supervisord -c /etc/supervisord.conf
