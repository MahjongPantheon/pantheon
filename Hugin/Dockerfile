FROM ghcr.io/mahjongpantheon/pantheon-backend-common:latest

# these should match auth data in dbinit_hugin.sql
ENV PHINX_DB_HUGIN_NAME hugin
ENV PHINX_DB_HUGIN_NAME_UNIT hugin_unit
ENV PHINX_DB_HUGIN_USER hugin
ENV PHINX_DB_HUGIN_PASS pgpass
ENV PHP_IDE_CONFIG serverName=pantheon_hugin

RUN echo "host_name hugin" >> /etc/munin/munin-node.conf

RUN ln -s /usr/lib/munin/plugins/processes /etc/munin/plugins/processes && \
  ln -s /usr/lib/munin/plugins/proc_pri /etc/munin/plugins/proc_pri && \
  ln -s /usr/lib/munin/plugins/threads /etc/munin/plugins/threads && \
  ln -s /usr/lib/munin/plugins/vmstat /etc/munin/plugins/vmstat

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY hugin-docker.nginx.conf /etc/nginx/http.d/hugin.conf

# copy munin config
COPY etc_munin/munin.conf /etc/munin/munin.conf

# Copy cron defs
COPY cron/tabs/nobody /var/spool/cron/crontabs/nobody
COPY cron/tabs/munin /var/spool/cron/crontabs/munin

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Hugin
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

