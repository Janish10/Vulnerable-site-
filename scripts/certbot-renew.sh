#!/usr/bin/env bash
# Renew all individual Let's Encrypt certs and reload nginx.
# Add to crontab: 0 3 * * * /path/to/certbot-renew.sh >> /var/log/certbot-renew.log 2>&1
#
# NOTE: manual DNS-01 certs cannot be renewed non-interactively.
# Certbot will attempt renewal for certs expiring within 30 days and
# prompt you to update TXT records in your .tech DNS panel for each one.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LE_DIR="$PROJECT_DIR/letsencrypt"

echo "[$(date)] Starting cert renewal..."
echo "[$(date)] You may be prompted to update DNS TXT records in your .tech panel."

docker run --rm -it \
  -v "$LE_DIR:/etc/letsencrypt" \
  certbot/certbot renew \
    --manual \
    --preferred-challenges dns

echo "[$(date)] Reloading nginx..."
cd "$PROJECT_DIR"
docker compose kill -s HUP nginx

echo "[$(date)] Done."
