#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

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

# Step 2: Ensure every subdomain has a TLS cert.
# Real LE certs can be issued with: bash scripts/certbot-issue.sh
echo "[2/5] Checking TLS certificates..."
MISSING=()
for domain in "${DOMAINS[@]}"; do
    if [ ! -f "letsencrypt/live/$domain/fullchain.pem" ]; then
        MISSING+=("$domain")
    fi
done

if [ "${#MISSING[@]}" -gt 0 ]; then
    echo "      Generating self-signed certs for ${#MISSING[@]} domain(s)..."
    for domain in "${MISSING[@]}"; do
        mkdir -p "letsencrypt/live/$domain"
        openssl req -x509 -newkey rsa:2048 -nodes \
            -keyout "letsencrypt/live/$domain/privkey.pem" \
            -out    "letsencrypt/live/$domain/fullchain.pem" \
            -days 90 -subj "/CN=$domain" \
            -addext "subjectAltName=DNS:$domain" 2>/dev/null
    done
    echo "      Self-signed certs created. Run 'bash scripts/certbot-issue.sh' for real certs."
else
    echo "      All ${#DOMAINS[@]} domain certs present."
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
SERVICES=(postgres backend nginx)
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
