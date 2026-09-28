#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "========================================="
echo "  Soltrisk Benchmark — Setup & Launch"
echo "========================================="
echo ""

# Step 1: Check hosts
if ! grep -q "krizznaa.tech" /etc/hosts 2>/dev/null; then
    echo "[1/5] Setting up /etc/hosts entries..."
    bash scripts/setup-hosts.sh
else
    echo "[1/5] Hosts entries already configured."
fi
echo ""

# Step 2: Generate TLS certs if missing
if [ ! -f "proxy/certs/wildcard.crt" ]; then
    echo "[2/5] Generating TLS certificates..."
    bash scripts/generate-certs.sh
else
    echo "[2/5] TLS certificates already present."
fi
echo ""

# Step 3: Copy .env if missing
if [ ! -f ".env" ]; then
    echo "[3/5] Creating .env from .env.example..."
    cp .env.example .env
else
    echo "[3/5] .env already exists."
fi
echo ""

# Step 4: Build and start
echo "[4/5] Building and starting all services..."
docker compose build --parallel
docker compose up -d
echo ""

# Step 5: Wait for health
echo "[5/5] Waiting for services to be healthy..."
SERVICES=(postgres backend proxy)
MAX_WAIT=120
ELAPSED=0

for svc in "${SERVICES[@]}"; do
    while [ $ELAPSED -lt $MAX_WAIT ]; do
        STATUS=$(docker compose ps --format json "$svc" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('Health',''))" 2>/dev/null || echo "")
        if [ "$STATUS" = "healthy" ] || [ "$STATUS" = "" ]; then
            break
        fi
        sleep 2
        ELAPSED=$((ELAPSED + 2))
    done
done
echo ""

echo "========================================="
echo "  All services running!"
echo "========================================="
echo ""
echo "Subdomains available at:"
echo "  https://krizznaa.tech          (landing)"
echo "  https://app.krizznaa.tech      (frontend)"
echo "  https://api.krizznaa.tech      (backend API)"
echo "  https://grafana.krizznaa.tech  (real Grafana)"
echo "  https://jenkins.krizznaa.tech  (real Jenkins)"
echo ""
echo "Benchmark targets:"
echo "  https://fake-grafana.krizznaa.tech"
echo "  https://fake-jenkins.krizznaa.tech"
echo "  https://kibana.krizznaa.tech"
echo "  https://prometheus.krizznaa.tech"
echo "  https://wordpress.krizznaa.tech"
echo "  https://nextcloud.krizznaa.tech"
echo "  https://angular.krizznaa.tech"
echo "  https://benign.krizznaa.tech"
echo "  https://admin.krizznaa.tech"
echo "  https://api-target.krizznaa.tech"
echo "  https://storage.krizznaa.tech"
echo "  https://nginx-old.krizznaa.tech"
echo "  https://nginx-current.krizznaa.tech"
echo "  https://certs.krizznaa.tech"
echo ""
echo "To score results:"
echo "  cd benchmark && npm run build && npm run score -- -i path/to/output.json"
