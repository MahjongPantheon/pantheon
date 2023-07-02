FROM docker.io/ctizen/pantheon_frontend_common:latest

RUN echo "host_name tyr" >> /etc/munin/munin-node.conf

RUN ln -s /usr/lib/munin/plugins/processes /etc/munin/plugins/processes && \
  ln -s /usr/lib/munin/plugins/proc_pri /etc/munin/plugins/proc_pri && \
  ln -s /usr/lib/munin/plugins/threads /etc/munin/plugins/threads && \
  ln -s /usr/lib/munin/plugins/vmstat /etc/munin/plugins/vmstat

# copy entry point
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh
RUN chmod 755 /entrypoint.sh

# copy nginx configs
COPY tyr-docker.nginx.conf /etc/nginx/http.d/tyr.conf

# Folders init
RUN mkdir -p /run/nginx
RUN mkdir -p /var/www/html/Tyr
RUN mkdir -p /var/www/html/Tyr-dist
RUN mkdir -p /var/www/html/Common

# Entry point
CMD ["/entrypoint.sh"]

