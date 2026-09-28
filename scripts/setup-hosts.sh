#!/usr/bin/env bash
set -euo pipefail

HOSTS_FILE="/etc/hosts"
MARKER="# soltrisk-benchmark krizznaa.tech subdomains"

SUBDOMAINS=(
    krizznaa.tech
    app.krizznaa.tech
    api.krizznaa.tech
    grafana.krizznaa.tech
    jenkins.krizznaa.tech
    fake-grafana.krizznaa.tech
    fake-jenkins.krizznaa.tech
    kibana.krizznaa.tech
    prometheus.krizznaa.tech
    wordpress.krizznaa.tech
    storage.krizznaa.tech
    nextcloud.krizznaa.tech
    angular.krizznaa.tech
    benign.krizznaa.tech
    admin.krizznaa.tech
    api-target.krizznaa.tech
    nginx-old.krizznaa.tech
    nginx-current.krizznaa.tech
    certs.krizznaa.tech
)

if grep -q "$MARKER" "$HOSTS_FILE" 2>/dev/null; then
    echo "Entries already present in $HOSTS_FILE — skipping."
    echo "To re-add, first run: sudo scripts/remove-hosts.sh"
    exit 0
fi

echo ""
echo "Adding ${#SUBDOMAINS[@]} krizznaa.tech subdomains to $HOSTS_FILE"
echo "This requires sudo."
echo ""

{
    echo ""
    echo "$MARKER"
    for domain in "${SUBDOMAINS[@]}"; do
        echo "127.0.0.1   $domain"
    done
    echo "# end soltrisk-benchmark"
} | sudo tee -a "$HOSTS_FILE" > /dev/null

echo "Done. Added ${#SUBDOMAINS[@]} entries."
echo ""
echo "Verify with:  grep krizznaa $HOSTS_FILE"
