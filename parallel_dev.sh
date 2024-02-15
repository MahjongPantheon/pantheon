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

echo 'Starting Sigrun dev';
make dev_sigrun &
SIGRUN_PID=$!
echo $SIGRUN_PID

echo 'Starting Bragi dev';
make dev_bragi &
BRAGI_PID=$!
echo $BRAGI_PID

echo 'Starting Skirnir dev';
make dev_skirnir &
SKIRNIR_PID=$!
echo $SKIRNIR_PID

trap "TRAPPED_SIGNAL=true; make tyr_stop; make forseti_stop; make sigrun_stop; make bragi_stop; make skirnir_stop;" SIGTERM  SIGINT

while :
do
    kill -0 $TYR_PID 2> /dev/null
    TYR_STATUS=$?

    kill -0 $FORSETI_PID 2> /dev/null
    FORSETI_STATUS=$?

    kill -0 $SIGRUN_PID 2> /dev/null
    SIGRUN_STATUS=$?

    kill -0 $BRAGI_PID 2> /dev/null
    BRAGI_STATUS=$?

    kill -0 $SKIRNIR_PID 2> /dev/null
    SKIRNIR_STATUS=$?

    if [ "$TRAPPED_SIGNAL" = "false" ]; then
        if [ $TYR_STATUS -ne 0 ] || [ $FORSETI_STATUS -ne 0 ] || [ $SIGRUN_STATUS -ne 0 ] || [ $BRAGI_STATUS -ne 0 ] || [ $SKIRNIR_STATUS -ne 0 ]; then
            if [ $FORSETI_STATUS -eq 0 ]; then
                kill -15 $FORSETI_PID;
                wait $FORSETI_PID;
            fi
            if [ $TYR_STATUS -eq 0 ]; then
                kill -15 $TYR_PID;
                wait $TYR_PID;
            fi
            if [ $SIGRUN_STATUS -eq 0 ]; then
                kill -15 $SIGRUN_PID;
                wait $SIGRUN_PID;
            fi
            if [ $BRAGI_STATUS -eq 0 ]; then
                kill -15 $BRAGI_PID;
                wait $BRAGI_PID;
            fi
            if [ $SKIRNIR_STATUS -eq 0 ]; then
                kill -15 $SKIRNIR_PID;
                wait $SKIRNIR_PID;
            fi
            exit 1;
        fi
    else
       if [ $TYR_STATUS -ne 0 ] && [ $FORSETI_STATUS -ne 0 ] && [ $SIGRUN_STATUS -ne 0 ] && [ $BRAGI_STATUS -ne 0 ] && [ $SKIRNIR_STATUS -ne 0 ]; then
            exit 0;
       fi
    fi

    sleep 1
done

