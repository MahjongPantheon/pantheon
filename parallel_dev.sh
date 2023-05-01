#!/bin/sh

TRAPPED_SIGNAL=false

echo 'Starting Tyr dev';
make dev_tyr &
TYR_PID=$!
echo $TYR_PID

echo 'Starting Forseti dev';
make dev_forseti &
FORSETI_PID=$!
echo $FORSETI_PID

trap "TRAPPED_SIGNAL=true; make tyr_stop; make forseti_stop;" SIGTERM  SIGINT

while :
do
    kill -0 $TYR_PID 2> /dev/null
    TYR_STATUS=$?

    kill -0 $FORSETI_PID 2> /dev/null
    FORSETI_STATUS=$?

    if [ "$TRAPPED_SIGNAL" = "false" ]; then
        if [ $TYR_STATUS -ne 0 ] || [ $FORSETI_STATUS -ne 0 ]; then
            if [ $FORSETI_STATUS -eq 0 ]; then
                kill -15 $FORSETI_PID;
                wait $FORSETI_PID;
            fi
            if [ $TYR_STATUS -eq 0 ]; then
                kill -15 $TYR_PID;
                wait $TYR_PID;
            fi
            exit 1;
        fi
    else
       if [ $TYR_STATUS -ne 0 ] && [ $FORSETI_STATUS -ne 0 ]; then
            exit 0;
       fi
    fi

    sleep 1
done

