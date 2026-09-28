#!/usr/bin/env bash
# Issue individual Let's Encrypt certs for every subdomain via DNS-01 challenge.
# Each subdomain gets its own certificate stored under letsencrypt/live/<domain>/.
#
# Two modes:
#   Automatic (recommended): place Cloudflare API credentials at
#     letsencrypt/cloudflare.ini  (see below) then run this script.
#   Manual: no credentials file — you are prompted to add a DNS TXT record
#     for each domain individually (19 interactions total).
#
# cloudflare.ini format:
#   dns_cloudflare_api_token = YOUR_CF_API_TOKEN
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LE_DIR="$PROJECT_DIR/letsencrypt"
CF_CREDS="$LE_DIR/cloudflare.ini"

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
echo "========================================="
echo "  Issuing ${#DOMAINS[@]} certificates (one per subdomain)"
echo ""

if [ ! -f "$CF_CREDS" ]; then
    echo "WARNING: No letsencrypt/cloudflare.ini found."
    echo "  Falling back to manual DNS-01 — you will be prompted"
    echo "  to add a TXT record for each of the ${#DOMAINS[@]} domains."
    echo ""
    echo "  For fully automated issuance, create letsencrypt/cloudflare.ini:"
    echo "    dns_cloudflare_api_token = YOUR_CF_API_TOKEN"
    echo ""
    read -r -p "Continue with manual mode? [y/N] " confirm
    [[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }
    echo ""
fi

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

    echo "  [issuing] $domain ..."

    if [ -f "$CF_CREDS" ]; then
        docker run --rm \
          -v "$LE_DIR:/etc/letsencrypt" \
          certbot/dns-cloudflare certonly \
            --dns-cloudflare \
            --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
            --dns-cloudflare-propagation-seconds 60 \
            --email admin@krizznaa.tech \
            --agree-tos \
            --no-eff-email \
            --non-interactive \
            -d "$domain" \
          && ISSUED=$((ISSUED + 1)) \
          || { echo "  [FAILED] $domain"; FAILED=$((FAILED + 1)); }
    else
        echo ""
        echo "  === Manual DNS-01 for: $domain ==="
        echo "  Add TXT record: _acme-challenge.$domain"
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
    fi
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
echo "Add this to your crontab for auto-renewal (runs at 3am daily):"
echo "  0 3 * * * $SCRIPT_DIR/certbot-renew.sh >> /var/log/certbot-renew.log 2>&1"
