#!/bin/sh

echo "export PS1=\"|\033[1;31m Fenrir container \033[0m~> \$PWD (\\u) \\$ \"" > /etc/profile.d/external.sh

echo 'Starting NGINX';
nginx -g "daemon off;"
