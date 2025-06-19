#!/bin/bash

cp /home/certbotrunner/letsencrypt/conf/live/pantheon.org/cert.pem /etc/nginx/cert/
cp /home/certbotrunner/letsencrypt/conf/live/pantheon.org/chain.pem /etc/nginx/cert/
cp /home/certbotrunner/letsencrypt/conf/live/pantheon.org/fullchain.pem /etc/nginx/cert/
cp /home/certbotrunner/letsencrypt/conf/live/pantheon.org/privkey.pem /etc/nginx/cert/
systemctl reload nginx
