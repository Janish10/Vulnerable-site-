#!/usr/bin/env bash
# Renew Let's Encrypt certs and reload nginx.
# Run via cron: 0 3 * * * /path/to/certbot-renew.sh
# Note: DNS-01 manual renewal is interactive; for non-interactive renewal
# install a DNS provider plugin (e.g. certbot-dns-cloudflare) inside the
# certbot/certbot image or on the host.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LE_DIR="$PROJECT_DIR/letsencrypt"

echo "[$(date)] Starting cert renewal..."

docker run --rm \
  -v "$LE_DIR:/etc/letsencrypt" \
  certbot/certbot renew --quiet

echo "[$(date)] Reloading nginx..."
cd "$PROJECT_DIR"
docker compose kill -s HUP nginx

echo "[$(date)] Done."
