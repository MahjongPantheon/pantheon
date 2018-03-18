#!/bin/bash

git fetch
git checkout origin/master
make deps
bin/phinx migrate -e staging
bin/phinx seed:run -e staging
