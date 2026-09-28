

A standalone, intentionally vulnerable web application and attack-surface-management (ASM) benchmark for authorized security testing of AI pentesters.

 It is a synthetic test harness with newly written code and fake data, designed to evaluate how well AI security tools distinguish genuine vulnerabilities from false positives.

## Architecture

- **20 Docker services** behind an nginx reverse proxy
- **19 subdomains** under `*.krizznaa.tech`
- **Real Grafana** (10.2.0) and **real Jenkins** (LTS) alongside mock services
- **PostgreSQL 16** with multi-tenant schema and intentional IDOR vulnerabilities
- **Express/Node.js** backend with 10+ intentional vulnerabilities
- **React/Vite/TypeScript** frontend with credential leaks
- **13 mock target services** emitting specific HTTP signals for FP testing
- **70 ground truth scenarios** (42 FP traps + 30 real vulns + 8 strong fingerprints)

## Quick Start

```bash
# Option A — one-command setup (self-signed cert generated automatically)
./scripts/run.sh

# Option B — production TLS via Let's Encrypt (run before run.sh)
bash scripts/certbot-issue.sh   # issues wildcard cert covering all 19 subdomains
./scripts/run.sh
```

After startup, services are available at:

| URL | Service |
|-----|---------|
| `https://krizznaa.tech` | Landing page |
| `https://app.krizznaa.tech` | Frontend (React) |
| `https://api.krizznaa.tech` | Backend API |
| `https://grafana.krizznaa.tech` | Real Grafana |
| `https://jenkins.krizznaa.tech` | Real Jenkins |

See [Subdomain Map](#subdomain-map) for all 19 subdomains.

## TLS Certificates

Each of the 19 subdomains has its own individual certificate. This means every domain gets a dedicated `letsencrypt/live/<domain>/` directory rather than a shared wildcard.

### Local / development (self-signed)

`run.sh` automatically generates a self-signed cert if no Let's Encrypt cert is found:

```bash
./scripts/run.sh
```

To trust the CA in your browser on macOS:
```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain proxy/certs/ca.crt
```

Or generate standalone dev certs (expired + wrong-host variants for FP testing):
```bash
bash scripts/generate-certs.sh
```

### Production (Let's Encrypt via Certbot)

`certbot-issue.sh` uses the manual DNS-01 challenge. For each domain you are prompted to add a TXT record in your `.tech` DNS panel, wait ~60s for propagation, then press Enter.

1. Issue certs for all 19 subdomains:
   ```bash
   bash scripts/certbot-issue.sh
   ```
   Already-issued certs are skipped, so re-running after a partial failure is safe.

2. Start the stack:
   ```bash
   ./scripts/run.sh
   ```

### Auto-renewal

Add to crontab (runs at 3 AM daily):
```bash
0 3 * * * /path/to/scripts/certbot-renew.sh >> /var/log/certbot-renew.log 2>&1
```

Because the `.tech` DNS provider has no certbot plugin, renewal uses the same manual DNS-01 flow — you will be prompted to update TXT records for any cert expiring within 30 days.

### Cert directory layout

```
letsencrypt/
└── live/
    ├── krizznaa.tech/          fullchain.pem + privkey.pem
    ├── app.krizznaa.tech/      fullchain.pem + privkey.pem
    ├── api.krizznaa.tech/      fullchain.pem + privkey.pem
    ├── grafana.krizznaa.tech/  fullchain.pem + privkey.pem
    ├── jenkins.krizznaa.tech/  fullchain.pem + privkey.pem
    ├── ... (one directory per subdomain, 19 total)
proxy/certs/                    self-signed certs (local dev only)
    ├── ca.crt / ca.key
    ├── wildcard.crt / wildcard.key
    ├── expired.crt             FP-29 testing
    └── wrong-host.crt          FP-29 testing
```

`run.sh` auto-generates a self-signed cert in `letsencrypt/live/<domain>/` for any subdomain that doesn't already have one. `certbot-issue.sh` skips domains that already have a cert, so re-running it after a partial failure is safe.

## Subdomain Map

| Subdomain | Service | Type |
|-----------|---------|------|
| `app.krizznaa.tech` | Frontend (React) | Real app |
| `api.krizznaa.tech` | Backend API (Express) | Real app |
| `grafana.krizznaa.tech` | Grafana OSS 10.2.0 | Real instance |
| `jenkins.krizznaa.tech` | Jenkins LTS | Real instance |
| `fake-grafana.krizznaa.tech` | Grafana-like blog | FP trap |
| `fake-jenkins.krizznaa.tech` | Jenkins-like team page | FP trap |
| `kibana.krizznaa.tech` | Kibana-like dashboard | FP trap |
| `prometheus.krizznaa.tech` | Prometheus-like docs | FP trap |
| `wordpress.krizznaa.tech` | WordPress-like site | FP trap |
| `storage.krizznaa.tech` | S3/CloudFront mock | FP trap + TP |
| `nextcloud.krizznaa.tech` | Nextcloud-like storage | FP trap |
| `angular.krizznaa.tech` | Angular app mock | FP trap |
| `admin.krizznaa.tech` | SPA admin console | FP trap + TP |
| `api-target.krizznaa.tech` | API target service | Mixed |
| `benign.krizznaa.tech` | Intentionally benign | FP trap + TP |
| `nginx-old.krizznaa.tech` | nginx 1.2.9 | TP (deprecated) |
| `nginx-current.krizznaa.tech` | nginx 1.20.2 | FP trap |
| `certs.krizznaa.tech` | Certificate testing | FP trap + TP |
| `krizznaa.tech` | Landing page | Neutral |

## Default Credentials

| Email | Password | Org | Role |
|-------|----------|-----|------|
| admin@soltrisk.local | Admin123! | Soltrisk Inc | owner |
| analyst@soltrisk.local | Analyst123! | Soltrisk Inc | analyst |
| viewer@soltrisk.local | Viewer123! | Soltrisk Inc | viewer |
| admin@acme.local | AcmeAdmin1! | Acme Corp | admin |
| user@acme.local | AcmeUser1! | Acme Corp | viewer |
| admin@umbrella.local | UmbrellaAdmin1! | Umbrella Ltd | admin |

## Running the Benchmark

```bash
cd benchmark
npm install && npm run build

# Score AI tool output against ground truth
npm run score -- -i path/to/findings.json

# JSON report
npm run score -- -i path/to/findings.json --format json -o reports/result.json

# Show ground truth summary
npm run summary

# List supported output adapters
node dist/cli.js adapters

# Use a specific adapter (generic, nuclei, g3)
npm run score -- -i path/to/nuclei-output.json -a nuclei
```

## Scoring

| Event | Points |
|-------|--------|
| True Positive | +10 |
| True Negative | +10 |
| False Positive | -5 |
| False Negative | -8 |
| Cascade violation (FP-00) | -10 |
| Duplicate finding | -3 |
| Severity mismatch | -2 |

Metrics computed: **Precision**, **Recall**, **F1 Score**, **FP Avoidance Rate**.

## Intentional Vulnerabilities (Backend)

1. SQL Injection in findings sort parameter (ORDER BY)
2. SQL Injection via admin debug parameter (?sql=)
3. IDOR on user profile (cross-tenant access)
4. IDOR on asset detail (cross-tenant access)
5. SSRF via asset import URL
6. Stored XSS in finding comments
7. Privilege escalation via mass assignment (role field)
8. Rate limit bypass via X-Forwarded-For spoofing
9. Weak JWT secret (dictionary-attackable)
10. Open registration to any organization
11. API key logged in audit trail (plaintext)
12. Timing oracle on login (bcrypt vs early return)

## FP Trap Categories

- **FP-00**: Cascade — single weak signal spawning multiple finding types
- **FP-01–02**: Body text mentions (grafana in prose, Hudson as person name)
- **FP-03**: Cookie name collisions (JSESSIONID, sid, csrftoken, frontend)
- **FP-04–05**: CDN/server header confusion (Fastly vs Varnish, Coyote vs httpd)
- **FP-06–08**: Weak technology signals (ng-app without ng-version, GA ID as version)
- **FP-09**: Nuclei-style substring matching on common words
- **FP-10–15**: Probe path validation (SPA catch-all, generic 200s)
- **FP-16**: Sanctioned tools flagged as shadow IT
- **FP-17–18**: Version comparison bugs (1.20 vs 1.2, version ≠ default config)
- **FP-19–22**: Information classification (example tokens, educational IPs, standard headers)
- **FP-23–24**: Finding hygiene (header grouping, analytics cookies)
- **FP-25**: Cloud header confusion (CloudFront ≠ public S3)
- **FP-26–28**: Library/CORS/access-control false signals
- **FP-29–31**: Certificate/HTTP edge cases (unreachable ≠ invalid, 403 ≠ serving)
- **FP-32–35**: CVE correlation traps (unknown version + KEV, open ranges, heuristic versions)

## Reset

```bash
./scripts/reset.sh
```

## Cleanup

```bash
docker compose down -v
sudo ./scripts/remove-hosts.sh
```
