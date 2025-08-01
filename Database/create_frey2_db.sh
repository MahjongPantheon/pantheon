#!/bin/bash

FREY2_EXISTS="$(psql --username postgres -c "\l" | grep frey2)"
if [ -z "$FREY2_EXISTS" ]; then
  psql --username "postgres" --dbname postgres < "/container-entrypoint-initdb.d/dbinit_frey2.sql";
fi
