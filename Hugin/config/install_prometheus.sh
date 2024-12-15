#!/bin/bash

set -ex
ARCH=$(uname -m)

mkdir -p /opt/prometheus
cd /opt/prometheus

if [ "$ARCH" == "x86_64" ]; then
  echo "Installing for x86_64";
  curl https://github.com/prometheus/prometheus/releases/download/v2.55.1/prometheus-2.55.1.linux-amd64.tar.gz -L -o prometheus.tar.gz
  curl https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-amd64.tar.gz -L -o node_exporter.tar.gz
else
  echo "Installing for arm64";
  curl https://github.com/prometheus/prometheus/releases/download/v2.55.1/prometheus-2.55.1.linux-amd64.tar.gz -L -o prometheus.tar.gz
  curl https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-arm64.tar.gz -L -o node_exporter.tar.gz
fi

tar -xvzf prometheus.tar.gz
tar -xvzf node_exporter.tar.gz
rm prometheus.tar.gz
rm node_exporter.tar.gz

mv prometheus*/prometheus /usr/local/bin/
mv prometheus*/promtool /usr/local/bin/
mkdir -p /etc/prometheus
mv prometheus*/prometheus.yml /etc/prometheus/
mkdir -p /var/lib/prometheus

mv prometheus*/consoles/ /etc/prometheus/
mv prometheus*/console_libraries/ /etc/prometheus/

mv node_exporter*/node_exporter /usr/local/bin/

cat /prometheus_partial_config.conf >> /etc/prometheus/prometheus.yml
