#!/bin/sh
# Compatibility with older scripts: lifecycle is owned by Compose.
exec "$(dirname "$0")/bin/pantheon" dev "$@"
