#!/bin/sh
set -e

# Ensure the SQLite data directory exists and is writable.
# When the volume is mounted for the first time the directory may not exist yet.
mkdir -p /app/.data

echo "Clipboard server starting on port ${NITRO_PORT:-3000}..."

exec "$@"
