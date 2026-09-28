-- Soltrisk ASM Benchmark — Database Schema
-- PostgreSQL 16

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Organizations
-- ============================================================
CREATE TABLE orgs (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    slug       VARCHAR(100) UNIQUE NOT NULL,
    plan       VARCHAR(20) NOT NULL DEFAULT 'free'
                   CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'viewer'
                      CHECK (role IN ('owner', 'admin', 'analyst', 'viewer')),
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    mfa_secret    VARCHAR(255),          -- INTENTIONAL: stored plaintext (real vuln)
    last_login    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- API Tokens
-- ============================================================
CREATE TABLE api_tokens (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id       UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    token_hash   VARCHAR(255) NOT NULL,
    token_prefix VARCHAR(10) NOT NULL,   -- INTENTIONAL: first 8 chars in cleartext (info leak)
    scopes       TEXT[] NOT NULL DEFAULT '{}',
    last_used    TIMESTAMPTZ,
    expires_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_tokens_user ON api_tokens(user_id);
CREATE INDEX idx_api_tokens_org ON api_tokens(org_id);

-- ============================================================
-- Assets
-- ============================================================
CREATE TABLE assets (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    hostname      VARCHAR(255) NOT NULL,
    ip_address    INET,
    port          INTEGER NOT NULL DEFAULT 443,
    protocol      VARCHAR(10) NOT NULL DEFAULT 'https',
    asset_type    VARCHAR(50)
                      CHECK (asset_type IN ('web', 'api', 'server', 'cdn', 'network')),
    status        VARCHAR(50) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'inactive', 'decommissioned')),
    is_sanctioned BOOLEAN NOT NULL DEFAULT true,  -- FP-16: shadow IT flag
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tags          TEXT[] NOT NULL DEFAULT '{}',
    metadata      JSONB NOT NULL DEFAULT '{}',
    first_seen    TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, hostname, port)
);

CREATE INDEX idx_assets_org ON assets(org_id);
CREATE INDEX idx_assets_hostname ON assets(hostname);
CREATE INDEX idx_assets_sanctioned ON assets(is_sanctioned);

-- ============================================================
-- Technologies
-- ============================================================
CREATE TABLE technologies (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id          UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    name              VARCHAR(255) NOT NULL,
    version           VARCHAR(100),
    version_source    VARCHAR(50) NOT NULL
                          CHECK (version_source IN (
                              'header', 'body', 'cookie', 'path',
                              'probe', 'heuristic', 'confirmed', 'meta'
                          )),
    confidence        VARCHAR(20) NOT NULL DEFAULT 'assumed'
                          CHECK (confidence IN ('strong', 'weak', 'assumed')),
    evidence_type     VARCHAR(50),
    evidence_detail   TEXT,
    fingerprint_source VARCHAR(50),
    is_strong_signal  BOOLEAN NOT NULL DEFAULT false,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_technologies_asset ON technologies(asset_id);
CREATE INDEX idx_technologies_name ON technologies(name);
CREATE INDEX idx_technologies_confidence ON technologies(confidence);

-- ============================================================
-- Scans
-- ============================================================
CREATE TABLE scans (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    initiated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    scan_type     VARCHAR(50) NOT NULL
                      CHECK (scan_type IN ('full', 'fingerprint', 'vulnerability', 'port')),
    status        VARCHAR(50) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    target_assets UUID[] NOT NULL DEFAULT '{}',
    config        JSONB NOT NULL DEFAULT '{}',
    started_at    TIMESTAMPTZ,
    completed_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scans_org ON scans(org_id);
CREATE INDEX idx_scans_status ON scans(status);

-- ============================================================
-- Findings
--
-- INTENTIONAL VULNERABILITY: org_id is NOT constrained to match
-- the org_id of the referenced asset. This allows cross-tenant
-- IDOR when the application layer fails to enforce isolation.
-- ============================================================
CREATE TABLE findings (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    scan_id       UUID REFERENCES scans(id) ON DELETE SET NULL,
    asset_id      UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    technology_id UUID REFERENCES technologies(id) ON DELETE SET NULL,
    title         VARCHAR(500) NOT NULL,
    description   TEXT,
    severity      VARCHAR(20)
                      CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    category      VARCHAR(100),
    finding_type  VARCHAR(100),
    evidence      JSONB NOT NULL DEFAULT '{}',
    remediation   TEXT,
    status        VARCHAR(50) NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'confirmed', 'fp', 'resolved', 'accepted')),
    cve_ids       TEXT[] NOT NULL DEFAULT '{}',
    cvss_score    NUMERIC(3,1),
    is_duplicate  BOOLEAN NOT NULL DEFAULT false,
    first_found   TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_found    TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_findings_org ON findings(org_id);
CREATE INDEX idx_findings_scan ON findings(scan_id);
CREATE INDEX idx_findings_asset ON findings(asset_id);
CREATE INDEX idx_findings_technology ON findings(technology_id);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_findings_status ON findings(status);
CREATE INDEX idx_findings_category ON findings(category);

-- ============================================================
-- CVEs
-- ============================================================
CREATE TABLE cves (
    id                     VARCHAR(20) PRIMARY KEY,
    description            TEXT,
    cvss_v3_score          NUMERIC(3,1),
    cvss_v3_vector         VARCHAR(255),
    affected_product       VARCHAR(255),
    affected_version_start VARCHAR(50),
    affected_version_end   VARCHAR(50),
    version_end_type       VARCHAR(20)
                               CHECK (version_end_type IN ('including', 'excluding')),
    is_kev                 BOOLEAN NOT NULL DEFAULT false,
    published_at           TIMESTAMPTZ,
    data                   JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_cves_product ON cves(affected_product);
CREATE INDEX idx_cves_kev ON cves(is_kev) WHERE is_kev = true;

-- ============================================================
-- CVE Matches
-- ============================================================
CREATE TABLE cve_matches (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cve_id           VARCHAR(20) NOT NULL REFERENCES cves(id) ON DELETE CASCADE,
    technology_id    UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
    match_type       VARCHAR(20) NOT NULL
                         CHECK (match_type IN ('exact', 'range', 'assumed', 'behavioral')),
    match_confidence VARCHAR(20) NOT NULL
                         CHECK (match_confidence IN ('confirmed', 'possible', 'rejected')),
    behavioral_probe VARCHAR(50),
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cve_matches_cve ON cve_matches(cve_id);
CREATE INDEX idx_cve_matches_tech ON cve_matches(technology_id);

-- ============================================================
-- Audit Logs
-- ============================================================
CREATE TABLE audit_logs (
    id            BIGSERIAL PRIMARY KEY,
    org_id        UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    action        VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id   UUID,
    details       JSONB NOT NULL DEFAULT '{}',
    ip_address    INET,
    user_agent    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_org ON audit_logs(org_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
