FROM docker.io/ctizen/pantheon_backend_common:latest

RUN echo "host_name hermod" >> /etc/munin/munin-node.conf

RUN ln -s /usr/lib/munin/plugins/processes /etc/munin/plugins/processes && \
  ln -s /usr/lib/munin/plugins/proc_pri /etc/munin/plugins/proc_pri && \
  ln -s /usr/lib/munin/plugins/postfix_mailqueue /etc/munin/plugins/postfix_mailqueue && \
  ln -s /usr/lib/munin/plugins/threads /etc/munin/plugins/threads && \
  ln -s /usr/lib/munin/plugins/vmstat /etc/munin/plugins/vmstat

COPY       /configs/supervisord.conf     /etc/supervisord.conf
COPY       /configs/rsyslog*.conf        /etc/
COPY       /configs/opendkim.conf        /etc/opendkim/opendkim.conf
COPY       /configs/smtp_header_checks   /etc/postfix/smtp_header_checks
COPY       /scripts/*.sh                 /

# copy nginx configs
COPY hermod-docker.nginx.conf /etc/nginx/http.d/hermod.conf

RUN        chmod +x /run.sh /opendkim.sh

VOLUME     [ "/var/spool/postfix", "/etc/postfix", "/etc/opendkim/keys" ]

USER       root
WORKDIR    /tmp

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Hermod

EXPOSE     587 25
CMD        ["/bin/sh", "-c", "/run.sh"]
