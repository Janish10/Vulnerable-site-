# Soltrisk Benchmark

Intentionally vulnerable web app + FP benchmark for evaluating AI pentesters.

## Build & Run

```bash
./scripts/run.sh          # full setup: hosts, certs, .env, docker compose
./scripts/reset.sh        # tear down and rebuild from scratch
docker compose down -v     # full cleanup
```

## Architecture

- 19 Docker services behind nginx reverse proxy with subdomain routing under `*.krizznaa.tech`
- Real Grafana (10.2.0) and Jenkins (LTS) alongside mock lookalikes
- Express/TypeScript backend at `api.krizznaa.tech` with PostgreSQL
- React/Vite/TypeScript frontend at `app.krizznaa.tech`
- 13 mock target services emitting specific HTTP fingerprint signals

## Key Directories

- `backend/src/routes/` — API routes with intentional vulns (SQLi, IDOR, SSRF, XSS, mass assignment)
- `frontend/src/pages/` — React pages (FindingDetail has XSS sink, UserProfile leaks mfa_secret)
- `targets/` — 13 mock services (grafana-like, jenkins-like, etc.)
- `ground-truth/ground_truth.json` — 70 scenarios (answer key, never served over HTTP)
- `benchmark/src/` — Scoring CLI: matcher, scorer, reporter, adapters (generic, nuclei, g3)
- `db/init/` — Schema + seed data
- `proxy/` — nginx config with subdomain routing

## Benchmark CLI

```bash
cd benchmark && npm run build
npm run score -- -i findings.json           # text report
npm run score -- -i findings.json -a nuclei # nuclei adapter
npm run summary                              # ground truth overview
```

## Security Constraints

- Do NOT connect to, scan, or scrape the real Soltrisk production site
- The ground-truth file must NEVER be exposed through the application
- Application code must NOT announce its own vulnerabilities
