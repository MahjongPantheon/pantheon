#!/bin/bash

cp /home/certbotrunner/letsencrypt/conf/live/riichimahjong.org/cert.pem /etc/nginx/cert/
cp /home/certbotrunner/letsencrypt/conf/live/riichimahjong.org/chain.pem /etc/nginx/cert/
cp /home/certbotrunner/letsencrypt/conf/live/riichimahjong.org/fullchain.pem /etc/nginx/cert/
cp /home/certbotrunner/letsencrypt/conf/live/riichimahjong.org/privkey.pem /etc/nginx/cert/
systemctl reload nginx
