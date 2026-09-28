#!/usr/bin/env bash
set -euo pipefail

CERT_DIR="$(cd "$(dirname "$0")/.." && pwd)/proxy/certs"
mkdir -p "$CERT_DIR"

echo "=== Generating TLS certificates for *.krizznaa.tech ==="
echo "Output: $CERT_DIR"
echo ""

# ── 1. Self-signed CA ───────────────────────────────────────────────
echo "[1/4] Creating self-signed CA..."
openssl genrsa -out "$CERT_DIR/ca.key" 4096 2>/dev/null
openssl req -x509 -new -nodes \
    -key "$CERT_DIR/ca.key" \
    -sha256 -days 3650 \
    -out "$CERT_DIR/ca.crt" \
    -subj "/C=US/ST=Security/L=Benchmark/O=Krizznaa CA/CN=Krizznaa Root CA"

# ── 2. Wildcard cert for *.krizznaa.tech (valid 365 days) ──────────
echo "[2/4] Creating wildcard cert for *.krizznaa.tech..."

cat > "$CERT_DIR/wildcard.cnf" <<'WCEOF'
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C = US
ST = Security
L = Benchmark
O = Krizznaa Technologies
CN = *.krizznaa.tech

[v3_req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.krizznaa.tech
DNS.2 = krizznaa.tech
WCEOF

openssl genrsa -out "$CERT_DIR/wildcard.key" 2048 2>/dev/null
openssl req -new \
    -key "$CERT_DIR/wildcard.key" \
    -out "$CERT_DIR/wildcard.csr" \
    -config "$CERT_DIR/wildcard.cnf"

openssl x509 -req \
    -in "$CERT_DIR/wildcard.csr" \
    -CA "$CERT_DIR/ca.crt" \
    -CAkey "$CERT_DIR/ca.key" \
    -CAcreateserial \
    -out "$CERT_DIR/wildcard.crt" \
    -days 365 \
    -sha256 \
    -extensions v3_req \
    -extfile "$CERT_DIR/wildcard.cnf" 2>/dev/null

echo "   wildcard.crt + wildcard.key created (valid 365 days)"

# ── 3. Expired cert (for FP-29 testing) ────────────────────────────
echo "[3/4] Creating expired certificate..."

cat > "$CERT_DIR/expired.cnf" <<'EXEOF'
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C = US
ST = Security
L = Benchmark
O = Krizznaa Technologies
CN = expired.krizznaa.tech

[v3_req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
subjectAltName = DNS:expired.krizznaa.tech
EXEOF

openssl genrsa -out "$CERT_DIR/expired.key" 2048 2>/dev/null
openssl req -new \
    -key "$CERT_DIR/expired.key" \
    -out "$CERT_DIR/expired.csr" \
    -config "$CERT_DIR/expired.cnf"

# Issue the cert with start date 2 days ago and end date yesterday
FAKETIME_START=$(date -u -v-2d +"%Y%m%d%H%M%SZ" 2>/dev/null || date -u -d "2 days ago" +"%Y%m%d%H%M%SZ")
FAKETIME_END=$(date -u -v-1d +"%Y%m%d%H%M%SZ" 2>/dev/null || date -u -d "1 day ago" +"%Y%m%d%H%M%SZ")

openssl ca -batch -notext \
    -startdate "$FAKETIME_START" \
    -enddate "$FAKETIME_END" \
    -cert "$CERT_DIR/ca.crt" \
    -keyfile "$CERT_DIR/ca.key" \
    -in "$CERT_DIR/expired.csr" \
    -out "$CERT_DIR/expired.crt" \
    -extensions v3_req \
    -extfile "$CERT_DIR/expired.cnf" 2>/dev/null || {
    # Fallback: use x509 with -days 0 if ca command unavailable
    openssl x509 -req \
        -in "$CERT_DIR/expired.csr" \
        -CA "$CERT_DIR/ca.crt" \
        -CAkey "$CERT_DIR/ca.key" \
        -CAcreateserial \
        -out "$CERT_DIR/expired.crt" \
        -days 0 \
        -sha256 \
        -extensions v3_req \
        -extfile "$CERT_DIR/expired.cnf" 2>/dev/null
}

echo "   expired.crt + expired.key created"

# ── 4. Wrong-hostname cert (for FP-29 testing) ─────────────────────
echo "[4/4] Creating wrong-hostname certificate..."

cat > "$CERT_DIR/wrong-host.cnf" <<'WHEOF'
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C = US
ST = Security
L = Benchmark
O = Wrong Corp
CN = wrong.example.com

[v3_req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
subjectAltName = DNS:wrong.example.com
WHEOF

openssl genrsa -out "$CERT_DIR/wrong-host.key" 2048 2>/dev/null
openssl req -new \
    -key "$CERT_DIR/wrong-host.key" \
    -out "$CERT_DIR/wrong-host.csr" \
    -config "$CERT_DIR/wrong-host.cnf"

openssl x509 -req \
    -in "$CERT_DIR/wrong-host.csr" \
    -CA "$CERT_DIR/ca.crt" \
    -CAkey "$CERT_DIR/ca.key" \
    -CAcreateserial \
    -out "$CERT_DIR/wrong-host.crt" \
    -days 365 \
    -sha256 \
    -extensions v3_req \
    -extfile "$CERT_DIR/wrong-host.cnf" 2>/dev/null

echo "   wrong-host.crt + wrong-host.key created"

# ── Cleanup CSR/CNF files ──────────────────────────────────────────
rm -f "$CERT_DIR"/*.csr "$CERT_DIR"/*.cnf "$CERT_DIR"/*.srl

echo ""
echo "=== All certificates generated ==="
echo ""
ls -la "$CERT_DIR"
echo ""
echo "To trust the CA on macOS:"
echo "  sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain $CERT_DIR/ca.crt"
