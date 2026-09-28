#!/usr/bin/env bash
set -euo pipefail

HOSTS_FILE="/etc/hosts"

if ! grep -q "soltrisk-benchmark krizznaa.tech" "$HOSTS_FILE" 2>/dev/null; then
    echo "No soltrisk-benchmark entries found in $HOSTS_FILE"
    exit 0
fi

echo "Removing soltrisk-benchmark entries from $HOSTS_FILE (requires sudo)"

sudo sed -i.bak '/# soltrisk-benchmark krizznaa.tech subdomains/,/# end soltrisk-benchmark/d' "$HOSTS_FILE"

echo "Done. Backup at ${HOSTS_FILE}.bak"
