#!/usr/bin/env bash
# Renew all individual Let's Encrypt certs and reload nginx.
# Add to crontab: 0 3 * * * /path/to/certbot-renew.sh >> /var/log/certbot-renew.log 2>&1
#
# Automatically uses the Cloudflare DNS plugin if letsencrypt/cloudflare.ini exists.
# Manual DNS-01 certs cannot be renewed non-interactively — use the Cloudflare plugin.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LE_DIR="$PROJECT_DIR/letsencrypt"
CF_CREDS="$LE_DIR/cloudflare.ini"

echo "[$(date)] Starting cert renewal for all domains..."

if [ -f "$CF_CREDS" ]; then
    echo "[$(date)] Using Cloudflare DNS plugin for renewal..."
    docker run --rm \
      -v "$LE_DIR:/etc/letsencrypt" \
      certbot/dns-cloudflare renew \
        --quiet \
        --dns-cloudflare \
        --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
        --dns-cloudflare-propagation-seconds 60
else
    echo "[$(date)] No cloudflare.ini found — attempting standard renewal..."
    echo "[$(date)] NOTE: manual DNS-01 certs cannot renew non-interactively."
    echo "[$(date)]       Create letsencrypt/cloudflare.ini to enable automated renewal."
    docker run --rm \
      -v "$LE_DIR:/etc/letsencrypt" \
      certbot/certbot renew --quiet
fi

echo "[$(date)] Reloading nginx..."
cd "$PROJECT_DIR"
docker compose kill -s HUP nginx

echo "[$(date)] Done."
