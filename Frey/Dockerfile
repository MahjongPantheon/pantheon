FROM docker.io/ctizen/pantheon_backend_common:latest

# these should match auth data in dbinit_frey.sql
ENV PHINX_DB_FREY_NAME frey
ENV PHINX_DB_FREY_NAME_UNIT frey_unit
ENV PHINX_DB_FREY_USER frey
ENV PHINX_DB_FREY_PASS pgpass

RUN echo "host_name frey" >> /etc/munin/munin-node.conf

RUN ln -s /usr/lib/munin/plugins/processes /etc/munin/plugins/processes && \
  ln -s /usr/lib/munin/plugins/proc_pri /etc/munin/plugins/proc_pri && \
  ln -s /usr/lib/munin/plugins/threads /etc/munin/plugins/threads && \
  ln -s /usr/lib/munin/plugins/vmstat /etc/munin/plugins/vmstat

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY frey-docker.nginx.conf /etc/nginx/http.d/frey.conf

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Frey
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

