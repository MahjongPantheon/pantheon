FROM alpine:3.17

RUN apk update && \
    apk upgrade && \
    apk add --no-cache --upgrade cyrus-sasl cyrus-sasl-login && \
    apk add \
        nginx \
        php81-fpm \
        php81-cli \
        php81-gmp \
        php81-json \
        munin-node \
        php81-mbstring \
        php81-openssl && \
    apk add --no-cache postfix && \
    apk add --no-cache opendkim && \
    apk add --no-cache --upgrade ca-certificates tzdata \
    supervisor rsyslog musl musl-utils bash opendkim-utils mailx && \
    (rm "/tmp/"* 2>/dev/null || true) && (rm -rf /var/cache/apk/* 2>/dev/null || true)

# Set environments
RUN sed -i "s|;*daemonize\s*=\s*yes|daemonize = no|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*clear_env\s*=\s*no|clear_env = no|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.max_children\s*=\s*.*|pm.max_children = 20|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.start_servers\s*=\s*.*|pm.start_servers = 10|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.min_spare_servers\s*=\s*.*|pm.min_spare_servers = 5|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*pm\.max_spare_servers\s*=\s*.*|pm.max_spare_servers = 10|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*listen\s*=\s*127.0.0.1:9000|listen = 9000|g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*listen\s*=\s*/||g" /etc/php81/php-fpm.d/www.conf && \
    sed -i "s|;*date.timezone =.*|date.timezone = ${TIMEZONE}|i" /etc/php81/php.ini && \
    sed -i "s|;*memory_limit =.*|memory_limit = ${PHP_MEMORY_LIMIT}|i" /etc/php81/php.ini && \
    sed -i "s|;*error_log =.*|error_log = ${PHP_LOGFILE}|i" /etc/php81/php.ini && \
    sed -i "s|;*upload_max_filesize =.*|upload_max_filesize = ${MAX_UPLOAD}|i" /etc/php81/php.ini && \
    sed -i "s|;*max_file_uploads =.*|max_file_uploads = ${PHP_MAX_FILE_UPLOAD}|i" /etc/php81/php.ini && \
    sed -i "s|;*max_execution_time =.*|max_execution_time = 1000|i" /etc/php81/php.ini && \
    sed -i "s|;*post_max_size =.*|post_max_size = ${PHP_MAX_POST}|i" /etc/php81/php.ini && \
    sed -i "s|;*cgi.fix_pathinfo=.*|cgi.fix_pathinfo = 0|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.enable=.*|opcache.enable = 1|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.enable_cli=.*|opcache.enable_cli = 1|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.memory_consumption=.*|opcache.memory_consumption = 128|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.interned_strings_buffer=.*|opcache.interned_strings_buffer=8|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.max_accelerated_files=.*|opcache.max_accelerated_files=4000|i" /etc/php81/php.ini && \
    sed -i "s|;*opcache.fast_shutdown=.*|opcache.fast_shutdown=1|i" /etc/php81/php.ini

# Munin setup
RUN sed -i '/^allow/d' /etc/munin/munin-node.conf
RUN echo 'allow ^.*$' >>/etc/munin/munin-node.conf
RUN echo "host_name hermod" >> /etc/munin/munin-node.conf

RUN ln -s /usr/lib/munin/plugins/cpu /etc/munin/plugins/cpu && \
  ln -s /usr/lib/munin/plugins/df /etc/munin/plugins/df && \
  ln -s /usr/lib/munin/plugins/df_inode /etc/munin/plugins/df_inode && \
  ln -s /usr/lib/munin/plugins/diskstats /etc/munin/plugins/diskstats && \
  ln -s /usr/lib/munin/plugins/forks /etc/munin/plugins/forks && \
  ln -s /usr/lib/munin/plugins/fw_conntrack /etc/munin/plugins/fw_conntrack && \
  ln -s /usr/lib/munin/plugins/fw_forwarded_local /etc/munin/plugins/fw_forwarded_local && \
  ln -s /usr/lib/munin/plugins/fw_packets /etc/munin/plugins/fw_packets && \
  ln -s /usr/lib/munin/plugins/interrupts /etc/munin/plugins/interrupts && \
  ln -s /usr/lib/munin/plugins/iostat /etc/munin/plugins/iostat && \
  ln -s /usr/lib/munin/plugins/load /etc/munin/plugins/load && \
  ln -s /usr/lib/munin/plugins/memory /etc/munin/plugins/memory && \
  ln -s /usr/lib/munin/plugins/netstat /etc/munin/plugins/netstat && \
  ln -s /usr/lib/munin/plugins/open_files /etc/munin/plugins/open_files && \
  ln -s /usr/lib/munin/plugins/open_inodes /etc/munin/plugins/open_inodes && \
  ln -s /usr/lib/munin/plugins/postfix_mailqueue /etc/munin/plugins/postfix_mailqueue && \
  ln -s /usr/lib/munin/plugins/processes /etc/munin/plugins/processes && \
  ln -s /usr/lib/munin/plugins/proc_pri /etc/munin/plugins/proc_pri && \
  ln -s /usr/lib/munin/plugins/swap /etc/munin/plugins/swap && \
  ln -s /usr/lib/munin/plugins/threads /etc/munin/plugins/threads && \
  ln -s /usr/lib/munin/plugins/uptime /etc/munin/plugins/uptime && \
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
