FROM docker.io/ctizen/pantheon_backend_common:latest

# these should match auth data in dbinit.sql
ENV PHINX_DB_NAME mimir
ENV PHINX_DB_NAME_UNIT mimir_unit
ENV PHINX_DB_USER mimir
ENV PHINX_DB_PASS pgpass

RUN echo "host_name mimir" >> /etc/munin/munin-node.conf

RUN ln -s /usr/lib/munin/plugins/processes /etc/munin/plugins/processes && \
  ln -s /usr/lib/munin/plugins/proc_pri /etc/munin/plugins/proc_pri && \
  ln -s /usr/lib/munin/plugins/threads /etc/munin/plugins/threads && \
  ln -s /usr/lib/munin/plugins/vmstat /etc/munin/plugins/vmstat

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY mimir-docker.nginx.conf /etc/nginx/http.d/mimir.conf

# Copy cron defs
COPY cron/tabs/nobody /var/spool/cron/crontabs/nobody

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Mimir
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

