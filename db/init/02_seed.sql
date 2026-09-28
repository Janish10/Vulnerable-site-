-- Soltrisk ASM Benchmark — Seed Data
-- Deterministic UUIDs for test reproducibility

-- ============================================================
-- Organizations
-- ============================================================
INSERT INTO orgs (id, name, slug, plan) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Soltrisk Corp',  'soltrisk',  'enterprise'),
    ('00000000-0000-0000-0000-000000000002', 'Acme Inc',       'acme',      'pro'),
    ('00000000-0000-0000-0000-000000000003', 'Umbrella Corp',  'umbrella',  'free');

-- ============================================================
-- Users
-- Passwords match README credentials (see Default Credentials table).
-- admin@soltrisk.local has mfa_secret stored in PLAINTEXT (intentional vuln).
-- ============================================================
INSERT INTO users (id, org_id, email, password_hash, role, first_name, last_name, mfa_secret, is_active) VALUES
    ('10000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'admin@soltrisk.local',
     '$2b$10$ZT3Dy1ojPf5zVl2f0tG8ae/odi5OGJsZ7QdiuiDUnmJwW8GTvitai',
     'admin', 'Alice', 'Chen',
     'JBSWY3DPEHPK3PXP',  -- INTENTIONAL: plaintext TOTP secret
     true),

    ('10000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000001',
     'analyst@soltrisk.local',
     '$2b$10$QZKlWmJvjvTpEsuRJCrNG.n66J0JLjksQTrCxEU4T25hioJWS4U8O',
     'analyst', 'Bob', 'Rivera',
     NULL, true),

    ('10000000-0000-0000-0000-000000000003',
     '00000000-0000-0000-0000-000000000001',
     'viewer@soltrisk.local',
     '$2b$10$rDzwyJDf25FNAwEJO4na2.sjmH/r1mGHllUomuYch0P3aScX5ak9i',
     'viewer', 'Carol', 'Nguyen',
     NULL, true),

    ('10000000-0000-0000-0000-000000000004',
     '00000000-0000-0000-0000-000000000002',
     'admin@acme.local',
     '$2b$10$YE38GpNBjricwJSsA1L9xOo7yCZJbkGdjemMxiszFTeB/yOQRYax2',
     'admin', 'David', 'Park',
     NULL, true),

    ('10000000-0000-0000-0000-000000000005',
     '00000000-0000-0000-0000-000000000002',
     'user@acme.local',
     '$2b$10$C2yzy5WycV733prKJKZ58.IJyBQitdBJ.FvXf7HnVY6KG.E.DUAzq',
     'viewer', 'Eva', 'Santos',
     NULL, true),

    ('10000000-0000-0000-0000-000000000006',
     '00000000-0000-0000-0000-000000000003',
     'admin@umbrella.local',
     '$2b$10$1AgBb3UTMEKD/d2vN44M/uUmxdB5SIG8h21krxQYzZCSg7m25QhqK',
     'admin', 'Frank', 'Weber',
     NULL, true);

-- ============================================================
-- Assets — Soltrisk Corp (krizznaa.tech subdomains)
-- ============================================================
INSERT INTO assets (id, org_id, hostname, port, protocol, asset_type, is_sanctioned, tags, metadata) VALUES
    -- Real Grafana instance (sanctioned)
    ('20000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'grafana.krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['monitoring', 'dashboards'],
     '{"description": "Production Grafana instance for infrastructure monitoring"}'),

    -- Real Jenkins instance (sanctioned)
    ('20000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000001',
     'jenkins.krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['ci-cd', 'build'],
     '{"description": "CI/CD pipeline server"}'),

    -- Kibana-like mock (sanctioned)
    ('20000000-0000-0000-0000-000000000003',
     '00000000-0000-0000-0000-000000000001',
     'kibana.krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['logging', 'observability'],
     '{"description": "Log analysis and visualization"}'),

    -- WordPress-like mock (sanctioned)
    ('20000000-0000-0000-0000-000000000004',
     '00000000-0000-0000-0000-000000000001',
     'wordpress.krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['blog', 'cms'],
     '{"description": "Corporate blog and content management"}'),

    -- Prometheus-like mock (sanctioned)
    ('20000000-0000-0000-0000-000000000005',
     '00000000-0000-0000-0000-000000000001',
     'prometheus.krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['monitoring', 'metrics'],
     '{"description": "Metrics collection and alerting"}'),

    -- Storage-like mock (sanctioned CDN)
    ('20000000-0000-0000-0000-000000000006',
     '00000000-0000-0000-0000-000000000001',
     'storage.krizznaa.tech', 443, 'https', 'cdn', true,
     ARRAY['storage', 'cdn'],
     '{"description": "Asset storage and CDN distribution"}'),

    -- Main web application (sanctioned)
    ('20000000-0000-0000-0000-000000000007',
     '00000000-0000-0000-0000-000000000001',
     'app.krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['asm', 'primary'],
     '{"description": "Soltrisk ASM platform frontend"}'),

    -- API backend (sanctioned)
    ('20000000-0000-0000-0000-000000000008',
     '00000000-0000-0000-0000-000000000001',
     'api.krizznaa.tech', 443, 'https', 'api', true,
     ARRAY['asm', 'api'],
     '{"description": "Soltrisk ASM platform API"}'),

    -- Admin console (sanctioned)
    ('20000000-0000-0000-0000-000000000009',
     '00000000-0000-0000-0000-000000000001',
     'admin.krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['admin'],
     '{"description": "Internal administration console"}'),

    -- Fake Grafana mock — NOT sanctioned (FP-16 shadow IT test)
    ('20000000-0000-0000-0000-000000000010',
     '00000000-0000-0000-0000-000000000001',
     'fake-grafana.krizznaa.tech', 443, 'https', 'web', false,
     ARRAY['unverified'],
     '{"description": "Unverified monitoring endpoint discovered during scan"}'),

    -- Fake Jenkins mock — NOT sanctioned (FP-16 shadow IT test)
    ('20000000-0000-0000-0000-000000000011',
     '00000000-0000-0000-0000-000000000001',
     'fake-jenkins.krizznaa.tech', 443, 'https', 'web', false,
     ARRAY['unverified'],
     '{"description": "Unverified CI/CD endpoint discovered during scan"}'),

    -- Benign test target (sanctioned)
    ('20000000-0000-0000-0000-000000000012',
     '00000000-0000-0000-0000-000000000001',
     'benign.krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['content', 'marketing'],
     '{"description": "Corporate content and documentation site"}'),

    -- nginx old version target (sanctioned)
    ('20000000-0000-0000-0000-000000000013',
     '00000000-0000-0000-0000-000000000001',
     'nginx-old.krizznaa.tech', 443, 'https', 'server', true,
     ARRAY['legacy'],
     '{"description": "Legacy web server pending migration"}'),

    -- nginx current version target (sanctioned)
    ('20000000-0000-0000-0000-000000000014',
     '00000000-0000-0000-0000-000000000001',
     'nginx-current.krizznaa.tech', 443, 'https', 'server', true,
     ARRAY['infrastructure'],
     '{"description": "Primary reverse proxy"}'),

    -- Nextcloud-like mock (sanctioned)
    ('20000000-0000-0000-0000-000000000015',
     '00000000-0000-0000-0000-000000000001',
     'nextcloud.krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['collaboration', 'files'],
     '{"description": "File sharing and collaboration platform"}'),

    -- Angular app mock (sanctioned)
    ('20000000-0000-0000-0000-000000000016',
     '00000000-0000-0000-0000-000000000001',
     'angular.krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['frontend', 'application'],
     '{"description": "Internal Angular application"}'),

    -- Certificate test target (sanctioned)
    ('20000000-0000-0000-0000-000000000017',
     '00000000-0000-0000-0000-000000000001',
     'certs.krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['infrastructure'],
     '{"description": "Certificate management endpoint"}'),

    -- API target mock (sanctioned)
    ('20000000-0000-0000-0000-000000000018',
     '00000000-0000-0000-0000-000000000001',
     'api-target.krizznaa.tech', 443, 'https', 'api', true,
     ARRAY['api', 'integration'],
     '{"description": "Third-party API integration endpoint"}'),

    -- Landing page (sanctioned)
    ('20000000-0000-0000-0000-000000000019',
     '00000000-0000-0000-0000-000000000001',
     'krizznaa.tech', 443, 'https', 'web', true,
     ARRAY['marketing'],
     '{"description": "Corporate landing page"}');

-- ============================================================
-- Assets — Acme Inc
-- ============================================================
INSERT INTO assets (id, org_id, hostname, port, protocol, asset_type, is_sanctioned, tags) VALUES
    ('20000000-0000-0000-0000-000000000020',
     '00000000-0000-0000-0000-000000000002',
     'acme-app.example.com', 443, 'https', 'web', true,
     ARRAY['primary']),

    ('20000000-0000-0000-0000-000000000021',
     '00000000-0000-0000-0000-000000000002',
     'acme-api.example.com', 443, 'https', 'api', true,
     ARRAY['api']);

-- ============================================================
-- Technologies
-- ============================================================
INSERT INTO technologies (id, asset_id, name, version, version_source, confidence, evidence_type, evidence_detail, fingerprint_source, is_strong_signal) VALUES
    -- nginx 1.20.2 on nginx-current (strong signal from Server header)
    ('30000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000014',
     'nginx', '1.20.2', 'header', 'strong',
     'header', 'Server: nginx/1.20.2', 'server-header', true),

    -- nginx 1.2.9 on nginx-old (strong signal from Server header)
    ('30000000-0000-0000-0000-000000000002',
     '20000000-0000-0000-0000-000000000013',
     'nginx', '1.2.9', 'header', 'strong',
     'header', 'Server: nginx/1.2.9', 'server-header', true),

    -- Grafana 10.2.0 on real Grafana (strong signal from behavioral probe)
    ('30000000-0000-0000-0000-000000000003',
     '20000000-0000-0000-0000-000000000001',
     'Grafana', '10.2.0', 'probe', 'strong',
     'probe', 'GET /api/health returned {"version":"10.2.0","database":"ok"}', 'api-health', true),

    -- Jenkins 2.426.3 on real Jenkins (strong signal from header)
    ('30000000-0000-0000-0000-000000000004',
     '20000000-0000-0000-0000-000000000002',
     'Jenkins', '2.426.3', 'header', 'strong',
     'header', 'X-Jenkins: 2.426.3', 'x-jenkins', true),

    -- WordPress (no version) on wordpress-like target (assumed/heuristic — FP-35 test)
    ('30000000-0000-0000-0000-000000000005',
     '20000000-0000-0000-0000-000000000004',
     'WordPress', NULL, 'heuristic', 'assumed',
     'body', 'Body contains /wp-includes/ in robots.txt', 'body-pattern', false),

    -- jQuery 3.6.0 on benign target (weak body match — FP-35 test)
    ('30000000-0000-0000-0000-000000000006',
     '20000000-0000-0000-0000-000000000012',
     'jQuery', '3.6.0', 'body', 'weak',
     'body', 'Script tag referencing jquery-3.6.0.min.js', 'body-script', false),

    -- React on benign target (strong body match)
    ('30000000-0000-0000-0000-000000000007',
     '20000000-0000-0000-0000-000000000012',
     'React', '18.2.0', 'body', 'strong',
     'body', '__REACT_DEVTOOLS_GLOBAL_HOOK__ and react-dom script bundle', 'body-script', true),

    -- Angular (no version) on angular-app target (weak body match — FP-06 test)
    ('30000000-0000-0000-0000-000000000008',
     '20000000-0000-0000-0000-000000000016',
     'Angular', NULL, 'body', 'weak',
     'body', 'ng-app attribute found without ng-version', 'body-attribute', false),

    -- Cloudflare on landing page (strong header signal — FP-36)
    ('30000000-0000-0000-0000-000000000009',
     '20000000-0000-0000-0000-000000000019',
     'Cloudflare', NULL, 'header', 'strong',
     'header', 'cf-ray: 8a1b2c3d4e5f6-LAX', 'cf-ray', true),

    -- Next.js on main app (strong body signal — FP-36)
    ('30000000-0000-0000-0000-000000000010',
     '20000000-0000-0000-0000-000000000007',
     'Next.js', '14.0.0', 'body', 'strong',
     'body', '__NEXT_DATA__ script tag and /_next/static/ asset paths', '__next_data__', true),

    -- Express on API (strong header signal)
    ('30000000-0000-0000-0000-000000000011',
     '20000000-0000-0000-0000-000000000008',
     'Express', NULL, 'header', 'strong',
     'header', 'X-Powered-By: Express', 'x-powered-by', true),

    -- Bootstrap on benign target (weak body match)
    ('30000000-0000-0000-0000-000000000012',
     '20000000-0000-0000-0000-000000000012',
     'Bootstrap', '5.3.0', 'body', 'weak',
     'body', 'Link to bootstrap.min.css', 'body-link', false),

    -- Kibana 8.9.0 on kibana target (strong header signal — FP-36)
    ('30000000-0000-0000-0000-000000000013',
     '20000000-0000-0000-0000-000000000003',
     'Kibana', '8.9.0', 'header', 'strong',
     'header', 'kbn-name: kibana, kbn-version: 8.9.0', 'kbn-name', true),

    -- Apache Tomcat on api-target (FP-05: Apache-Coyote is Tomcat, not httpd)
    ('30000000-0000-0000-0000-000000000014',
     '20000000-0000-0000-0000-000000000018',
     'Apache Tomcat', '9.0', 'header', 'strong',
     'header', 'Server: Apache-Coyote/1.1', 'server-header', true),

    -- Google Analytics on benign target (FP-08)
    ('30000000-0000-0000-0000-000000000015',
     '20000000-0000-0000-0000-000000000012',
     'Google Analytics', NULL, 'body', 'strong',
     'body', 'gtag/js?id=G-K7XM2R8VQP', 'body-script', true);

-- ============================================================
-- Scans
-- ============================================================
INSERT INTO scans (id, org_id, initiated_by, scan_type, status, target_assets, config, started_at, completed_at) VALUES
    -- Completed full scan for Soltrisk Corp
    ('40000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000001',
     'full', 'completed',
     ARRAY[
         '20000000-0000-0000-0000-000000000001'::UUID,
         '20000000-0000-0000-0000-000000000002'::UUID,
         '20000000-0000-0000-0000-000000000003'::UUID,
         '20000000-0000-0000-0000-000000000004'::UUID,
         '20000000-0000-0000-0000-000000000005'::UUID,
         '20000000-0000-0000-0000-000000000012'::UUID,
         '20000000-0000-0000-0000-000000000013'::UUID,
         '20000000-0000-0000-0000-000000000014'::UUID
     ],
     '{"depth": "full", "include_cve": true, "include_fingerprint": true}',
     now() - INTERVAL '2 hours',
     now() - INTERVAL '1 hour'),

    -- Pending fingerprint scan for Acme Inc
    ('40000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000004',
     'fingerprint', 'pending',
     ARRAY[
         '20000000-0000-0000-0000-000000000020'::UUID,
         '20000000-0000-0000-0000-000000000021'::UUID
     ],
     '{"depth": "fingerprint", "include_cve": false}',
     NULL, NULL);

-- ============================================================
-- Findings (from completed Soltrisk scan)
-- ============================================================
INSERT INTO findings (id, org_id, scan_id, asset_id, technology_id, title, description, severity, category, finding_type, evidence, remediation, status, cve_ids, cvss_score) VALUES
    -- Outdated nginx detected
    ('50000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000013',
     '30000000-0000-0000-0000-000000000002',
     'Outdated nginx 1.2.9 detected',
     'The web server is running nginx 1.2.9 which reached end-of-life. Multiple known vulnerabilities affect this version.',
     'high', 'deprecated_software', 'outdated_version',
     '{"server_header": "nginx/1.2.9", "source": "Server response header"}',
     'Upgrade nginx to a supported version (1.24.x or 1.26.x).',
     'open',
     ARRAY['CVE-2021-23017'], 6.5),

    -- Missing security headers on benign target
    ('50000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000012',
     NULL,
     'Missing security headers',
     'The response is missing several recommended security headers including Content-Security-Policy and Strict-Transport-Security.',
     'low', 'misconfiguration', 'missing_headers',
     '{"missing": ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options", "Referrer-Policy"]}',
     'Configure appropriate security headers on the web server.',
     'open', ARRAY[]::TEXT[], NULL),

    -- Grafana admin panel exposed
    ('50000000-0000-0000-0000-000000000003',
     '00000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000001',
     '30000000-0000-0000-0000-000000000003',
     'Grafana admin panel exposed',
     'Grafana login interface is publicly accessible at /login. The instance responds with valid Grafana fingerprints including grafana_session cookie and /api/health endpoint.',
     'medium', 'exposed_admin', 'admin_panel',
     '{"url": "https://grafana.krizznaa.tech/login", "fingerprints": ["grafana_session cookie", "/api/health returns version 10.2.0", "x-grafana-version header"]}',
     'Restrict access to the Grafana login page using network controls or VPN.',
     'confirmed', ARRAY[]::TEXT[], NULL),

    -- Jenkins admin panel exposed
    ('50000000-0000-0000-0000-000000000004',
     '00000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000002',
     '30000000-0000-0000-0000-000000000004',
     'Jenkins admin panel exposed',
     'Jenkins CI server is publicly accessible. The X-Jenkins header confirms version 2.426.3 and the crumb issuer endpoint is responsive.',
     'high', 'exposed_admin', 'admin_panel',
     '{"url": "https://jenkins.krizznaa.tech/", "fingerprints": ["X-Jenkins: 2.426.3", "/crumbIssuer/api/json responds", "jenkins_remember_me cookie"]}',
     'Place Jenkins behind a VPN or restrict access to authorized CIDR ranges.',
     'open', ARRAY[]::TEXT[], NULL),

    -- Technology inventory on benign site
    ('50000000-0000-0000-0000-000000000005',
     '00000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000012',
     '30000000-0000-0000-0000-000000000006',
     'Client-side library: jQuery 3.6.0',
     'jQuery 3.6.0 detected from script tag reference. This version has known XSS vulnerabilities.',
     'info', 'technology', 'client_library',
     '{"source": "script tag", "path": "/js/jquery-3.6.0.min.js"}',
     'Update jQuery to version 3.7.1 or later.',
     'open',
     ARRAY['CVE-2020-11022'], 6.1),

    -- Kibana fingerprint
    ('50000000-0000-0000-0000-000000000006',
     '00000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000003',
     '30000000-0000-0000-0000-000000000013',
     'Kibana interface detected',
     'Kibana 8.9.0 identified via kbn-name and kbn-version response headers.',
     'info', 'technology', 'fingerprint',
     '{"headers": {"kbn-name": "kibana", "kbn-version": "8.9.0"}}',
     'Ensure Kibana access is restricted to authorized users.',
     'open', ARRAY[]::TEXT[], NULL),

    -- Apache-Coyote / Tomcat detection (FP-05 test data)
    ('50000000-0000-0000-0000-000000000007',
     '00000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000018',
     '30000000-0000-0000-0000-000000000014',
     'Apache Tomcat detected via Coyote connector',
     'Server header Apache-Coyote/1.1 identifies this as Apache Tomcat, not Apache HTTP Server.',
     'info', 'technology', 'fingerprint',
     '{"server_header": "Apache-Coyote/1.1", "product": "Apache Tomcat", "note": "Coyote is the Tomcat HTTP connector"}',
     NULL,
     'open', ARRAY[]::TEXT[], NULL),

    -- Prometheus metrics endpoint exposed (real finding)
    ('50000000-0000-0000-0000-000000000008',
     '00000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000005',
     NULL,
     'Prometheus metrics endpoint publicly accessible',
     'The /metrics endpoint returns Prometheus exposition format data without authentication. This may expose internal system metrics.',
     'medium', 'information_disclosure', 'exposed_metrics',
     '{"url": "https://prometheus.krizznaa.tech/metrics", "response_type": "text/plain", "sample_metrics": ["process_cpu_seconds_total", "go_goroutines", "http_requests_total"]}',
     'Restrict access to the /metrics endpoint or require authentication.',
     'open', ARRAY[]::TEXT[], NULL),

    -- Intentional cross-tenant finding (IDOR test data)
    -- This finding belongs to Soltrisk Corp but references an Acme asset
    ('50000000-0000-0000-0000-000000000009',
     '00000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000020',  -- Acme's asset! Cross-tenant IDOR test
     NULL,
     'Misconfigured TLS certificate',
     'The TLS certificate does not match the expected hostname.',
     'medium', 'misconfiguration', 'certificate_mismatch',
     '{"expected_hostname": "acme-app.example.com", "cert_cn": "*.example.com"}',
     'Install a certificate matching the hostname.',
     'open', ARRAY[]::TEXT[], NULL),

    -- WordPress with no version (FP-35 scenario)
    ('50000000-0000-0000-0000-000000000010',
     '00000000-0000-0000-0000-000000000001',
     '40000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000004',
     '30000000-0000-0000-0000-000000000005',
     'WordPress detected (version unknown)',
     'WordPress indicators found but version could not be confirmed. Evidence is heuristic only.',
     'info', 'technology', 'fingerprint',
     '{"source": "heuristic", "evidence": "/wp-includes/ found in robots.txt", "confidence": "assumed", "version": null}',
     NULL,
     'open', ARRAY[]::TEXT[], NULL);

-- ============================================================
-- CVEs
-- ============================================================
INSERT INTO cves (id, description, cvss_v3_score, cvss_v3_vector, affected_product, affected_version_start, affected_version_end, version_end_type, is_kev, published_at) VALUES
    -- nginx CVEs
    ('CVE-2021-23017',
     'A security issue in nginx resolver could allow an attacker who is able to forge UDP packets from the DNS server to cause 1-byte memory overwrite.',
     7.7, 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H',
     'nginx', '0.6.18', '1.20.1', 'excluding',
     false, '2021-06-01'),

    ('CVE-2022-41741',
     'NGINX Open Source before 1.23.2 and NGINX Plus before R27-p2 have a vulnerability in the module ngx_http_mp4_module.',
     7.8, 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
     'nginx', '1.1.3', '1.23.2', 'excluding',
     false, '2022-10-19'),

    -- FP-33: open-ended range (no upper bound)
    ('CVE-2009-4487',
     'nginx 0.7.64 allows remote attackers to inject arbitrary characters into log files via crafted HTTP requests.',
     NULL, NULL,
     'nginx', '0.7.64', NULL, NULL,
     false, '2010-01-13'),

    -- Grafana CVEs
    ('CVE-2023-3128',
     'Grafana is validating Azure AD accounts based on the email claim. On Azure AD, the profile email field is not unique and can be easily modified. This leads to account takeover.',
     9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
     'Grafana', '6.7.0', '10.0.1', 'excluding',
     false, '2023-06-22'),

    -- FP-32: KEV-flagged CVE for Grafana
    ('CVE-2021-43798',
     'Grafana 8.0.0-beta1 through 8.3.0 is vulnerable to directory traversal, allowing access to local files.',
     7.5, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
     'Grafana', '8.0.0', '8.3.1', 'excluding',
     true, '2021-12-07'),

    ('CVE-2023-22462',
     'Grafana is an open-source platform for monitoring and observability. On 2023-01-01, a stored XSS vulnerability was identified.',
     6.4, 'CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N',
     'Grafana', '9.2.0', '9.2.10', 'excluding',
     false, '2023-03-02'),

    -- Jenkins CVEs
    -- FP-32: KEV-flagged CVE for Jenkins
    ('CVE-2024-23897',
     'Jenkins 2.441 and earlier, LTS 2.426.2 and earlier does not disable a feature of its CLI command parser that replaces certain character sequences with file contents.',
     9.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
     'Jenkins', '0.0.1', '2.442', 'excluding',
     true, '2024-01-24'),

    ('CVE-2023-27898',
     'Jenkins 2.270 through 2.393 (both inclusive), LTS 2.277.1 through 2.375.3 (both inclusive) does not escape the Jenkins URL in the build notification.',
     8.8, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H',
     'Jenkins', '2.270', '2.394', 'excluding',
     false, '2023-03-10'),

    ('CVE-2023-35141',
     'Jenkins 2.399 and earlier, LTS 2.387.3 and earlier does not require POST requests for a form validation method, resulting in a CSRF vulnerability.',
     8.0, 'CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:U/C:H/I:H/A:H',
     'Jenkins', '0.0.1', '2.400', 'excluding',
     false, '2023-06-14'),

    -- WordPress CVEs
    ('CVE-2023-5561',
     'WordPress does not properly restrict which user fields are searchable via the REST API, allowing unauthenticated attackers to discern the email addresses of users.',
     5.3, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N',
     'WordPress', '4.7.0', '6.3.2', 'excluding',
     false, '2023-10-16'),

    -- FP-33: open-ended range for WordPress
    ('CVE-2008-4769',
     'Directory traversal vulnerability in the wp-admin/includes/file.php in WordPress before 2.6.2 allows remote attackers to read arbitrary files.',
     7.5, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
     'WordPress', '0.0.1', NULL, NULL,
     false, '2008-10-28'),

    ('CVE-2023-39999',
     'WordPress before 6.3.2 is vulnerable to Contributor role users accessing other users posts.',
     4.3, 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N',
     'WordPress', '4.7.0', '6.3.2', 'excluding',
     false, '2023-10-13'),

    -- jQuery CVEs
    ('CVE-2020-11022',
     'In jQuery versions greater than or equal to 1.2 and before 3.5.0, passing HTML from untrusted sources to one of jQuerys DOM manipulation methods may execute untrusted code.',
     6.1, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
     'jQuery', '1.2.0', '3.5.0', 'excluding',
     false, '2020-04-29'),

    ('CVE-2015-9251',
     'jQuery before 3.0.0 is vulnerable to Cross-site Scripting (XSS) attacks when a cross-domain Ajax request is performed without the dataType option.',
     6.1, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
     'jQuery', '0.0.1', '3.0.0', 'excluding',
     false, '2018-01-18'),

    ('CVE-2020-11023',
     'In jQuery versions greater than or equal to 1.0.3 and before 3.5.0, passing HTML containing <option> elements from untrusted sources to one of jQuerys DOM manipulation methods may execute untrusted code.',
     6.1, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
     'jQuery', '1.0.3', '3.5.0', 'excluding',
     false, '2020-04-29'),

    -- Kibana CVEs
    ('CVE-2023-31415',
     'Kibana versions before 8.7.1 contain an arbitrary code execution flaw via XSLT.',
     9.1, 'CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:C/C:H/I:H/A:H',
     'Kibana', '8.0.0', '8.7.1', 'excluding',
     false, '2023-05-04'),

    ('CVE-2024-23442',
     'An open redirect issue was discovered in Kibana that could lead to a user being redirected to an arbitrary website.',
     6.1, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
     'Kibana', '7.17.0', '8.13.0', 'excluding',
     false, '2024-03-29'),

    -- Nextcloud CVEs
    ('CVE-2023-48239',
     'Nextcloud Server before 25.0.13, 26.x before 26.0.8, and 27.x before 27.1.3 allows Server-Side Request Forgery.',
     7.7, 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:N/A:N',
     'Nextcloud', '25.0.0', '27.1.3', 'excluding',
     false, '2023-12-22'),

    -- Apache Tomcat CVE (for FP-05 test)
    ('CVE-2024-23672',
     'Denial of Service via incomplete cleanup vulnerability in Apache Tomcat.',
     7.5, 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
     'Apache Tomcat', '8.5.0', '11.0.0', 'excluding',
     false, '2024-03-13');

-- ============================================================
-- CVE Matches (linking technologies to applicable CVEs)
-- ============================================================
INSERT INTO cve_matches (id, cve_id, technology_id, match_type, match_confidence, behavioral_probe, notes) VALUES
    -- nginx 1.2.9 matches CVE-2021-23017 (1.2.9 < 1.20.1)
    ('60000000-0000-0000-0000-000000000001',
     'CVE-2021-23017',
     '30000000-0000-0000-0000-000000000002',
     'range', 'confirmed', NULL,
     'nginx 1.2.9 is within affected range 0.6.18 to 1.20.1'),

    -- nginx 1.2.9 matches CVE-2022-41741 (1.2.9 < 1.23.2)
    ('60000000-0000-0000-0000-000000000002',
     'CVE-2022-41741',
     '30000000-0000-0000-0000-000000000002',
     'range', 'confirmed', NULL,
     'nginx 1.2.9 is within affected range 1.1.3 to 1.23.2'),

    -- nginx 1.20.2 does NOT match CVE-2021-23017 (1.20.2 >= 1.20.1)
    -- No row inserted — absence means no match

    -- Grafana 10.2.0 does NOT match CVE-2023-3128 (10.2.0 >= 10.0.1)
    -- No row inserted

    -- Grafana 10.2.0 does NOT match CVE-2021-43798 (10.2.0 is outside 8.0.0-8.3.0)
    -- No row inserted

    -- Jenkins 2.426.3 matches CVE-2024-23897 (2.426.3 < 2.442)
    ('60000000-0000-0000-0000-000000000003',
     'CVE-2024-23897',
     '30000000-0000-0000-0000-000000000004',
     'range', 'confirmed', 'jenkins-crumb',
     'Jenkins 2.426.3 is within affected range, crumb endpoint confirms Jenkins'),

    -- Jenkins 2.426.3 matches CVE-2023-35141 (2.426.3 > 2.400 — should NOT match)
    -- No row inserted — 2.426.3 >= 2.400 fix boundary

    -- jQuery 3.6.0 matches CVE-2020-11022 — BUT confidence is 'assumed' because version_source is heuristic
    ('60000000-0000-0000-0000-000000000004',
     'CVE-2020-11022',
     '30000000-0000-0000-0000-000000000006',
     'range', 'possible', NULL,
     'jQuery 3.6.0 is NOT in the affected range (< 3.5.0). Version 3.6.0 >= 3.5.0. This match should be REJECTED.'),

    -- jQuery 3.6.0 vs CVE-2015-9251 — 3.6.0 >= 3.0.0 so NOT affected
    -- No row inserted

    -- Kibana 8.9.0 matches CVE-2024-23442 (8.9.0 is in range 7.17.0 to 8.13.0)
    ('60000000-0000-0000-0000-000000000005',
     'CVE-2024-23442',
     '30000000-0000-0000-0000-000000000013',
     'range', 'confirmed', NULL,
     'Kibana 8.9.0 is within affected range 7.17.0 to 8.13.0');

-- ============================================================
-- API Tokens
-- ============================================================
INSERT INTO api_tokens (id, user_id, org_id, name, token_hash, token_prefix, scopes, expires_at) VALUES
    ('70000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'CI Pipeline Token',
     '$2b$10$LZm8VRqHFNYxE7c5sGF3h.Q2TJx5R5F9vK8aL3rN1mP4oS6uW0yXi',
     'slt_ci_a',
     ARRAY['read:assets', 'read:findings'],
     now() + INTERVAL '90 days'),

    ('70000000-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000001',
     'Integration Token',
     '$2b$10$xY9wQ3kE7nR1pS5mJ8hG2.T4vU6bA0cF3dI7lO9qW2eK5iN8rH1jM',
     'slt_int_',
     ARRAY['read:assets', 'write:scans'],
     now() + INTERVAL '365 days');

-- ============================================================
-- Audit Logs (sample entries)
-- ============================================================
INSERT INTO audit_logs (org_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent) VALUES
    ('00000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000001',
     'login', 'user', '10000000-0000-0000-0000-000000000001',
     '{"method": "password", "success": true}',
     '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),

    ('00000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000001',
     'create', 'asset', '20000000-0000-0000-0000-000000000001',
     '{"hostname": "grafana.krizznaa.tech", "asset_type": "web"}',
     '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),

    ('00000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000002',
     'trigger_scan', 'scan', '40000000-0000-0000-0000-000000000001',
     '{"scan_type": "full", "target_count": 8}',
     '10.0.0.51', 'Mozilla/5.0 (X11; Linux x86_64)'),

    ('00000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000001',
     'create_token', 'api_token', '70000000-0000-0000-0000-000000000001',
     '{"token_name": "CI Pipeline Token", "scopes": ["read:assets", "read:findings"]}',
     '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),

    ('00000000-0000-0000-0000-000000000002',
     '10000000-0000-0000-0000-000000000004',
     'login', 'user', '10000000-0000-0000-0000-000000000004',
     '{"method": "password", "success": true}',
     '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
