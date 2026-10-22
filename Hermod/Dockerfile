ARG CONTAINER_ARCH=amd64
FROM ghcr.io/mahjongpantheon/pantheon-container-base-v4-${CONTAINER_ARCH}:latest

RUN apk add --no-cache postfix rsyslog opendkim opendkim-utils ca-certificates

COPY       /configs/supervisord.conf     /etc/supervisord.conf
COPY       /configs/rsyslog*.conf        /etc/
COPY       /configs/opendkim.conf        /etc/opendkim/opendkim.conf
COPY       /configs/smtp_header_checks   /etc/postfix/smtp_header_checks
COPY       /scripts/*.sh                 /

# copy nginx configs
COPY hermod-container.nginx.conf /etc/nginx/http.d/hermod.conf

RUN        chmod +x /run.sh /opendkim.sh

USER       root
WORKDIR    /tmp

# Folders init
RUN mkdir -p /etc/opendkim/keys
RUN mkdir -p /var/www/html/Hermod /var/www/html/Hermod-dist

EXPOSE     587 25
CMD        ["/bin/sh", "-c", "/run.sh"]
