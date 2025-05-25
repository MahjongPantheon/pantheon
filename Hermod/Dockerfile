FROM ghcr.io/mahjongpantheon/pantheon-backend-common-v2:latest

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
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Hermod

EXPOSE     587 25
CMD        ["/bin/sh", "-c", "/run.sh"]
