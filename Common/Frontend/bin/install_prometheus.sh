#!/bin/bash

set -ex
ARCH=$(uname -m)

mkdir -p /opt/prometheus
cd /opt/prometheus

if [ "$ARCH" == "x86_64" ]; then
  echo "Installing for x86_64";
  curl https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-amd64.tar.gz -L -o node_exporter.tar.gz
else
  echo "Installing for arm64";
  curl https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-arm64.tar.gz -L -o node_exporter.tar.gz
fi

tar -xvzf node_exporter.tar.gz
rm node_exporter.tar.gz
