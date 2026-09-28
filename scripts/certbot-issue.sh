#!/usr/bin/env bash
# Issue individual Let's Encrypt certs for every subdomain via manual DNS-01 challenge.
# Each subdomain gets its own certificate stored under letsencrypt/live/<domain>/.
#
# When prompted for each domain, add a TXT record in your .tech DNS panel:
#   Name:  _acme-challenge.<subdomain>
#   Value: <token shown by certbot>
# Wait ~60s for DNS to propagate, then press Enter to continue.
#
# Already-issued certs are skipped, so re-running after a partial failure is safe.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LE_DIR="$PROJECT_DIR/letsencrypt"

DOMAINS=(
    "krizznaa.tech"
    "app.krizznaa.tech"
    "api.krizznaa.tech"
    "grafana.krizznaa.tech"
    "jenkins.krizznaa.tech"
    "fake-grafana.krizznaa.tech"
    "fake-jenkins.krizznaa.tech"
    "kibana.krizznaa.tech"
    "prometheus.krizznaa.tech"
    "wordpress.krizznaa.tech"
    "storage.krizznaa.tech"
    "nextcloud.krizznaa.tech"
    "angular.krizznaa.tech"
    "benign.krizznaa.tech"
    "admin.krizznaa.tech"
    "api-target.krizznaa.tech"
    "nginx-old.krizznaa.tech"
    "nginx-current.krizznaa.tech"
    "certs.krizznaa.tech"
)

mkdir -p "$LE_DIR"

echo "========================================="
echo "  Certbot — Individual Certs for krizznaa.tech"
echo "  ${#DOMAINS[@]} domains, manual DNS-01 challenge"
echo "========================================="
echo ""
echo "For each domain you will be asked to add a TXT record in"
echo "your .tech DNS panel, then press Enter to continue."
echo ""

ISSUED=0
SKIPPED=0
FAILED=0

for domain in "${DOMAINS[@]}"; do
    CERT_PATH="$LE_DIR/live/$domain/fullchain.pem"

    if [ -f "$CERT_PATH" ]; then
        echo "  [skip] $domain — cert already exists"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    echo ""
    echo "  [$((ISSUED + SKIPPED + FAILED + 1))/${#DOMAINS[@]}] Issuing cert for: $domain"
    echo "  Add TXT record -> Name: _acme-challenge.$domain"
    echo ""

    docker run --rm -it \
      -v "$LE_DIR:/etc/letsencrypt" \
      certbot/certbot certonly \
        --manual \
        --preferred-challenges dns \
        --email admin@krizznaa.tech \
        --agree-tos \
        --no-eff-email \
        -d "$domain" \
      && ISSUED=$((ISSUED + 1)) \
      || { echo "  [FAILED] $domain"; FAILED=$((FAILED + 1)); }
done

echo ""
echo "========================================="
echo "  Done: $ISSUED issued, $SKIPPED skipped, $FAILED failed"
echo "========================================="
echo ""
if [ "$FAILED" -gt 0 ]; then
    echo "Re-run this script to retry failed domains (existing certs are skipped)."
    echo ""
fi
echo "Add this to your crontab for renewal reminders (runs at 3am daily):"
echo "  0 3 * * * $SCRIPT_DIR/certbot-renew.sh >> /var/log/certbot-renew.log 2>&1"
