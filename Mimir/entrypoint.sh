#!/bin/sh

export HOME=/home/user
echo "export PS1=\"|\033[1;31m Mimir container \033[0m~> \$PWD (\\u) \\$ \"" > /etc/profile.d/external.sh

TRAPPED_SIGNAL=false

echo 'Starting NGINX';
nginx -g "daemon off;" 2>&1 &
NGINX_PID=$!

echo 'Starting PM2';

cd /var/www/html/Mimir-dist && pm2-runtime ecosystem.config.js --env production 2>&1 &
PM2_PID=$!

trap "TRAPPED_SIGNAL=true; kill -15 $NGINX_PID; kill -15 $PM2_PID" SIGTERM  SIGINT

while :
do
    kill -0 $NGINX_PID 2> /dev/null
    NGINX_STATUS=$?

    kill -0 $PM2_PID 2> /dev/null
    PM2_STATUS=$?

    if [ "$TRAPPED_SIGNAL" = "false" ]; then
        if [ $NGINX_STATUS -ne 0 ] || [ $PM2_STATUS -ne 0 ]; then
            if [ $NGINX_STATUS -eq 0 ]; then
                kill -15 $NGINX_PID;
                wait $NGINX_PID;
            fi
            if [ $PM2_STATUS -eq 0 ]; then
                kill -15 $PM2_PID;
                wait $PM2_PID;
            fi
            exit 1;
        fi
    else
       if [ $NGINX_STATUS -ne 0 ] && [ $PM2_STATUS -ne 0 ]; then
            exit 0;
       fi
    fi

    sleep 1
done

