#!/usr/bin/env bash
# One-time wildcard cert issuance via Certbot DNS-01 challenge.
# Run this once on the host before starting Docker Compose.
# You will be prompted to add a DNS TXT record to prove domain ownership.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LE_DIR="$PROJECT_DIR/letsencrypt"

mkdir -p "$LE_DIR"

echo "========================================="
echo "  Certbot — Wildcard Cert for krizznaa.tech"
echo "========================================="
echo ""
echo "This uses DNS-01 challenge (required for wildcard certs)."
echo "When prompted, add a TXT record _acme-challenge.krizznaa.tech"
echo "to your DNS provider, then press Enter to continue."
echo ""

docker run --rm -it \
  -v "$LE_DIR:/etc/letsencrypt" \
  certbot/certbot certonly \
    --manual \
    --preferred-challenges dns \
    --email admin@krizznaa.tech \
    --agree-tos \
    --no-eff-email \
    -d "krizznaa.tech" \
    -d "*.krizznaa.tech"

echo ""
echo "Certificate issued successfully."
echo "Stored at: $LE_DIR/live/krizznaa.tech/"
echo ""
echo "Add this to your crontab for auto-renewal (runs at 3am daily):"
echo "  0 3 * * * $SCRIPT_DIR/certbot-renew.sh >> /var/log/certbot-renew.log 2>&1"
