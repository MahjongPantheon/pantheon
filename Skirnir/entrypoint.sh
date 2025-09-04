#!/bin/sh

export HOME=/home/user
echo "export PS1=\"|\033[1;31m Skirnir container \033[0m~> \$PWD (\\u) \\$ \"" > /etc/profile.d/external.sh

exec supervisord -c /etc/supervisord.conf
