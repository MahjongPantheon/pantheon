#!/bin/bash

export HOME=/home/user
cat /env/"$ENV_FILENAME" | grep -v '# ' | grep -v  -e '^$' | awk '{ print "export " $1 }' > /etc/profile.d/external.sh
echo "export PS1=\"|\033[1;31m Tyr container \033[0m~> \$PWD (\\u) \\$ \"" >> /etc/profile.d/external.sh
. /etc/profile.d/external.sh

# yarn care
mkdir /home/user/.yarn-cache
chown user /home/user/.yarn-cache
# composer care
mkdir /home/user/.composer-cache
chown user /home/user/.composer-cache

munin-node

TRAPPED_SIGNAL=false

echo 'Starting NGINX';
nginx -g "daemon off;" 2>&1 &
NGINX_PID=$!

trap "TRAPPED_SIGNAL=true; kill -15 $NGINX_PID; " SIGTERM  SIGINT

while :
do
    kill -0 $NGINX_PID 2> /dev/null
    NGINX_STATUS=$?

    if [ "$TRAPPED_SIGNAL" = "false" ]; then
        if [ $NGINX_STATUS -ne 0 ]; then
            if [ $NGINX_STATUS -eq 0 ]; then
                kill -15 $NGINX_PID;
                wait $NGINX_PID;
            fi
            exit 1;
        fi
    else
       if [ $NGINX_STATUS -ne 0 ]; then
            exit 0;
       fi
    fi

    sleep 1
done

