#!/bin/bash

cd /home/certbotrunner/letsencrypt/

certbot \
    --config-dir=./conf \
    --work-dir=./workdir \
    --logs-dir=./logs \
    certonly --webroot \
    -w /srv/assist.pantheon.org -d assist.pantheon.org \
    -w /srv/manage.pantheon.org -d manage.pantheon.org \
    -w /srv/gameapi.pantheon.org/www -d gameapi.pantheon.org \
    -w /srv/userapi.pantheon.org/www -d userapi.pantheon.org \
    -w /srv/rating.pantheon.org/www -d rating.pantheon.org \
    -w /srv/syslog.pantheon.org/www -d syslog.pantheon.org \
    -w /srv/storage.pantheon.org/www -d storage.pantheon.org
