#!/bin/sh

TRAPPED_SIGNAL=false

echo 'Starting Frey dev';
make dev_frey &
FREY_PID=$!
echo $FREY_PID

echo 'Starting Mimir dev';
make dev_mimir &
MIMIR_PID=$!
echo $MIMIR_PID

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

echo 'Starting Gullveig dev';
make dev_gullveig &
GULLVEIG_PID=$!
echo $GULLVEIG_PID

echo 'Starting Meili dev';
make dev_meili &
MEILI_PID=$!
echo $MEILI_PID

echo 'Starting Hermod dev';
make dev_hermod &
HERMOD_PID=$!
echo $HERMOD_PID

trap "TRAPPED_SIGNAL=true; make frey_stop; make mimir_stop; make tyr_stop; make forseti_stop; make sigrun_stop; make bragi_stop; make skirnir_stop; make gullveig_stop; make hermod_stop; make meili_stop;" SIGTERM  SIGINT

while :
do
    kill -0 $TYR_PID 2> /dev/null
    TYR_STATUS=$?

    kill -0 $FREY_PID 2> /dev/null
    FREY_STATUS=$?

    kill -0 $MIMIR_PID 2> /dev/null
    MIMIR_STATUS=$?

    kill -0 $FORSETI_PID 2> /dev/null
    FORSETI_STATUS=$?

    kill -0 $SIGRUN_PID 2> /dev/null
    SIGRUN_STATUS=$?

    kill -0 $BRAGI_PID 2> /dev/null
    BRAGI_STATUS=$?

    kill -0 $SKIRNIR_PID 2> /dev/null
    SKIRNIR_STATUS=$?

    kill -0 $GULLVEIG_PID 2> /dev/null
    GULLVEIG_STATUS=$?

    kill -0 $MEILI_PID 2> /dev/null
    MEILI_STATUS=$?

    kill -0 $HERMOD_PID 2> /dev/null
    HERMOD_STATUS=$?

    if [ "$TRAPPED_SIGNAL" = "false" ]; then
        if [ $TYR_STATUS -ne 0 ] || [ $FREY_STATUS -ne 0 ] || [ $MIMIR_STATUS -ne 0 ] || [ $FORSETI_STATUS -ne 0 ] || [ $SIGRUN_STATUS -ne 0 ] || [ $BRAGI_STATUS -ne 0 ] || [ $SKIRNIR_STATUS -ne 0 ] || [ $GULLVEIG_STATUS -ne 0 ] || [ $MEILI_STATUS -ne 0 ] || [ $HERMOD_STATUS -ne 0 ]; then
            if [ $FORSETI_STATUS -eq 0 ]; then
                kill -15 $FORSETI_PID;
                wait $FORSETI_PID;
            fi
            if [ $FREY_STATUS -eq 0 ]; then
                kill -15 $FREY_PID;
                wait $FREY_PID;
            fi
            if [ $MIMIR_STATUS -eq 0 ]; then
                kill -15 $MIMIR_PID;
                wait $MIMIR_PID;
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
            if [ $GULLVEIG_STATUS -eq 0 ]; then
                kill -15 $GULLVEIG_PID;
                wait $GULLVEIG_PID;
            fi
            if [ $MEILI_STATUS -eq 0 ]; then
                kill -15 $MEILI_PID;
                wait $MEILI_PID;
            fi
            if [ $HERMOD_STATUS -eq 0 ]; then
                kill -15 $HERMOD_PID;
                wait $HERMOD_PID;
            fi
            exit 1;
        fi
    else
       if [ $TYR_STATUS -ne 0 ] && [ $FORSETI_STATUS -ne 0 ] && [ $FREY_STATUS -ne 0 ] && [ $MIMIR_STATUS -ne 0 ] && [ $SIGRUN_STATUS -ne 0 ] && [ $BRAGI_STATUS -ne 0 ] && [ $SKIRNIR_STATUS -ne 0 ] && [ $GULLVEIG_STATUS -ne 0 ] && [ $MEILI_STATUS -ne 0 ] && [ $HERMOD_STATUS -ne 0 ]; then
            exit 0;
       fi
    fi

    sleep 1
done
