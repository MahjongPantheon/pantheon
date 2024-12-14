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

cp prometheus*/prometheus /usr/local/bin/prometheus
cp prometheus*/promtool /usr/local/bin/promtool
mkdir -p /etc/prometheus
cp prometheus*/prometheus.yml /etc/prometheus/prometheus.yml
mkdir -p /var/lib/prometheus

cp -r prometheus*/consoles/ /etc/prometheus/consoles/
cp -r prometheus*/console_libraries/ /etc/prometheus/console_libraries/

