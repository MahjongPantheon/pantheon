#!/bin/bash

cd /home/certbotrunner/letsencrypt/

certbot \
    --config-dir=./conf \
    --work-dir=./workdir \
    --logs-dir=./logs \
    certonly --webroot \
    -w /srv/assist.riichimahjong.org -d assist.riichimahjong.org \
    -w /srv/manage.riichimahjong.org -d manage.riichimahjong.org \
    -w /srv/gameapi.riichimahjong.org/www -d gameapi.riichimahjong.org \
    -w /srv/userapi.riichimahjong.org/www -d userapi.riichimahjong.org \
    -w /srv/rating.riichimahjong.org/www -d rating.riichimahjong.org \
    -w /srv/syslog.riichimahjong.org/www -d syslog.riichimahjong.org \
    -w /srv/storage.riichimahjong.org/www -d storage.riichimahjong.org \
    -w /srv/assist.riichimahjong.org -d m.riichi.top \
    -w /srv/rating.riichimahjong.org/www -d r.riichi.top
