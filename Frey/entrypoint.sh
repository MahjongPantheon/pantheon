#!/bin/sh

export HOME=/home/user
echo "export PS1=\"|\033[1;31m Frey container \033[0m~> \$PWD (\\u) \\$ \"" > /etc/profile.d/external.sh

munin-node

TRAPPED_SIGNAL=false

echo 'Starting NGINX';
nginx -g "daemon off;" 2>&1 &
NGINX_PID=$!

echo 'Starting PHP-FPM';
php-fpm83 -R -F 2>&1 &
PHP_FPM_PID=$!

echo 'Starting Memcached';
memcached -u user 2>&1 &
MC_PID=$!

trap "TRAPPED_SIGNAL=true; kill -15 $NGINX_PID; kill -15 $PHP_FPM_PID; kill -15 $MC_PID" SIGTERM  SIGINT

while :
do
    kill -0 $NGINX_PID 2> /dev/null
    NGINX_STATUS=$?

    kill -0 $PHP_FPM_PID 2> /dev/null
    PHP_FPM_STATUS=$?

    kill -0 $MC_PID 2> /dev/null
    MC_STATUS=$?

    if [ "$TRAPPED_SIGNAL" = "false" ]; then
        if [ $NGINX_STATUS -ne 0 ] || [ $PHP_FPM_STATUS -ne 0 ] || [ $MC_STATUS -ne 0 ]; then
            if [ $NGINX_STATUS -eq 0 ]; then
                kill -15 $NGINX_PID;
                wait $NGINX_PID;
            fi
            if [ $PHP_FPM_STATUS -eq 0 ]; then
                kill -15 $PHP_FPM_PID;
                wait $PHP_FPM_PID;
            fi
            if [ $MC_STATUS -eq 0 ]; then
                kill -15 $MC_PID;
                wait $MC_PID;
            fi
            exit 1;
        fi
    else
       if [ $NGINX_STATUS -ne 0 ] && [ $PHP_FPM_STATUS -ne 0 ] && [ $MC_STATUS -ne 0 ]; then
            exit 0;
       fi
    fi

    sleep 1
done

