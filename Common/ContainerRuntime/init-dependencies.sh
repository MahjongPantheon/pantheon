#!/bin/sh
set -eu
root=${1:-/.pnpm}
mkdir -p "$root/store" "$root/cache/pnpm"
for project in Frey Mimir Frey-dist Mimir-dist Hugin-dist Gullveig-dist Meili-dist Hermod-dist Skirnir-dist Sigrun-dist Bragi-dist; do
  mkdir -p "$root/modules/$project"
done
