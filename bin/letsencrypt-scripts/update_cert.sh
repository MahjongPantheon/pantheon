#!/bin/bash

cd /home/certbotrunner/letsencrypt/

echo "Updating certs..."
certbot \
    --config-dir=./conf \
    --work-dir=./workdir \
    --logs-dir=./logs \
    renew --verbose
echo "Success!"
