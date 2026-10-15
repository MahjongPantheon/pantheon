#!/bin/bash

MIMIR2_EXISTS="$(psql --username postgres -c "\l" | grep mimir2)"
if [ -z "$MIMIR2_EXISTS" ]; then
  psql --username "postgres" --dbname postgres < "/container-entrypoint-initdb.d/dbinit_mimir2.sql";
fi
