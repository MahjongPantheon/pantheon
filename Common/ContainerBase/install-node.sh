#!/bin/sh
set -eu

. "$(dirname "$0")/node-release.env"

case "$(uname -m)" in
  x86_64)
    archive="node-v${NODE_VERSION}-linux-x64-musl.tar.xz"
    checksum=$NODE_X64_MUSL_SHA256
    ;;
  aarch64)
    archive="node-v${NODE_VERSION}.tar.xz"
    checksum=$NODE_SOURCE_SHA256
    ;;
  *) echo 'Unsupported Node.js architecture' >&2; exit 1 ;;
esac
workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT HUP INT TERM
cd "$workdir"
curl --fail --silent --show-error --location --retry 3 \
  "https://nodejs.org/dist/v${NODE_VERSION}/${archive}" --output "$archive"
echo "${checksum}  ${archive}" | sha256sum -c -

if [ "$(uname -m)" = aarch64 ]; then
  tar -xJf "$archive"
  cd "node-v${NODE_VERSION}"
  ./configure --prefix=/usr/local --with-intl=full-icu
  make -j"${NODE_BUILD_JOBS:-2}"
  make install
else
  tar -xJf "$archive" -C /usr/local --strip-components=1 --no-same-owner
fi

test "$(node --version)" = "v${NODE_VERSION}"
npm --version
node -e 'require("node:crypto").randomBytes(16); new Intl.DateTimeFormat("de-DE").format(new Date())'
