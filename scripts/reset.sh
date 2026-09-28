#!/bin/bash
set -e

echo "=== Soltrisk Benchmark Reset ==="

cd "$(dirname "$0")/.."

echo "[1/4] Stopping all containers..."
docker compose down -v --remove-orphans 2>/dev/null || true

echo "[2/4] Removing build cache..."
docker compose build --no-cache 2>/dev/null || true

echo "[3/4] Starting fresh environment..."
docker compose up -d

echo "[4/4] Waiting for services to be ready..."
sleep 10

echo ""
echo "Checking service health..."
for svc in $(docker compose ps --services 2>/dev/null); do
  status=$(docker compose ps "$svc" --format '{{.Status}}' 2>/dev/null | head -1)
  echo "  $svc: $status"
done

echo ""
echo "=== Reset complete ==="
echo "Access the app at: https://app.krizznaa.tech"
echo "API docs at: https://api.krizznaa.tech/api/docs"
echo ""
echo "Default credentials:"
echo "  admin@soltrisk.local / Admin123!"
echo "  analyst@soltrisk.local / Analyst123!"
echo "  viewer@soltrisk.local / Viewer123!"
