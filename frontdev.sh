#!/bin/sh

# ------------ Local user init (for make & build tasks) --------

# Add local user
# Either use the LOCAL_USER_ID if passed in at runtime or
# fallback

USER_ID=${LOCAL_USER_ID:-9001}

TRAPPED_SIGNAL=false

echo 'Starting ngdev';
cd ../Tyr
make docker &
NGDEV_PID=$!

echo 'Starting webpack dev';
cd ../Tyr.new
make docker &
WPDEV_PID=$!

trap "TRAPPED_SIGNAL=true; kill -15 $NGDEV_PID; kill -15 $WPDEV_PID;" SIGTERM  SIGINT

while :
do
    kill -0 $NGDEV_PID 2> /dev/null
    NGDEV_STATUS=$?

    kill -0 $WPDEV_PID 2> /dev/null
    WPDEV_STATUS=$?

    if [ "$TRAPPED_SIGNAL" = "false" ]; then
        if [ $NGDEV_STATUS -ne 0 ] || [ $WPDEV_STATUS -ne 0 ]; then
            if [ $NGDEV_STATUS -eq 0 ]; then
                kill -15 $NGDEV_PID;
                wait $NGDEV_PID;
            fi
            if [ $WPDEV_STATUS -eq 0 ]; then
                kill -15 $WPDEV_PID;
                wait $WPDEV_PID;
            fi
            exit 1;
        fi
    else
       if [ $NGDEV_STATUS -ne 0 ] && [ $WPDEV_STATUS -ne 0 ]; then
            exit 0;
       fi
    fi

    sleep 1
done

