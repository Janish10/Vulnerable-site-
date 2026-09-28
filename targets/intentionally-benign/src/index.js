const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http');

app.use(cookieParser());
app.use(express.json());

// FP-00: Cascade test — single weak signal must not cascade
app.get('/cascade-test', (req, res) => {
  res.cookie('session', 'abc123');
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Strategic Consulting Partners</title></head>
<body>
<h1>Welcome to Strategic Consulting Partners</h1>
<p>Our team of consul professionals provides expert consulting services across industries.
We consul with enterprises on digital transformation, cloud architecture, and DevOps strategy.
Kate Hudson manages our west-coast consulting division.</p>
<p>Contact our consul team for a free assessment.</p>
</body></html>`);
});

// FP-03: csrftoken cookie does not mean Django
app.get('/django-app', (req, res) => {
  res.cookie('csrftoken', 'zXy9kWm3LqR7vBn2PjS8', { httpOnly: false });
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Task Manager</title></head>
<body>
<h1>Task Manager Pro</h1>
<p>Manage your projects efficiently.</p>
<form><input name="csrfmiddlewaretoken" type="hidden" value="zXy9kWm3LqR7vBn2PjS8"><button>Submit</button></form>
</body></html>`);
});

// FP-03: frontend cookie does not mean Magento
app.get('/magento-store', (req, res) => {
  res.cookie('frontend', 'r8s9t0u1v2w3x4y5z6a7b8', { httpOnly: false });
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Artisan Goods Store</title></head>
<body>
<h1>Artisan Goods</h1>
<p>Handcrafted furniture and home decor.</p>
<div class="product-grid"><div class="product">Oak Table - $450</div><div class="product">Maple Chair - $180</div></div>
</body></html>`);
});

// FP-04: x-served-by: cache-xxx does NOT confirm Fastly
app.get('/cdn-page', (req, res) => {
  res.set({
    'x-served-by': 'cache-lax17928-LAX',
    'via': '1.1 varnish',
    'x-cache': 'HIT',
    'x-cache-hits': '3',
    'age': '45',
  });
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>CDN Test Page</title></head>
<body><h1>Content Delivery Network</h1><p>This page is served via a caching proxy.</p></body></html>`);
});

// FP-05: Apache-Coyote/1.1 is Tomcat, NOT Apache httpd
app.get('/tomcat-app', (req, res) => {
  res.set('Server', 'Apache-Coyote/1.1');
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Enterprise Portal</title></head>
<body><h1>Employee Self-Service Portal</h1><p>Welcome to the HR portal.</p></body></html>`);
});

// FP-08: GA measurement ID is not a software version
app.get('/analytics', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Marketing Analytics</title>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC1234XYZ"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-ABC1234XYZ');</script>
</head>
<body><h1>Marketing Dashboard</h1><p>Track your campaign performance.</p></body></html>`);
});

// FP-09: Natural prose with common words
app.get('/search', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Knowledge Base Search</title></head>
<body>
<h1>Search Results</h1>
<p>The server processes your request through our proxy layer before reaching the admin team for review. Our platform server handles thousands of requests daily, and our admin staff ensures quality.</p>
<p>Our proxy configuration routes traffic efficiently across multiple server nodes.</p>
</body></html>`);
});

// FP-12: Custom favicon for hash comparison testing
app.get('/favicon.ico', (req, res) => {
  const buf = Buffer.from(
    '0000010001001010000001002000680400001600000028000000100000002000000001002000000000004004000000000000000000000000000000000000',
    'hex'
  );
  res.type('image/x-icon').send(buf);
});

// FP-16: Sanctioned tools inventory
app.get('/sanctioned-tools', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Approved Tools Registry</title></head>
<body>
<h1>Organization Approved Software</h1>
<h2>Sanctioned Monitoring & CI/CD Tools</h2>
<table border="1"><thead><tr><th>Tool</th><th>Version</th><th>Status</th><th>Owner</th></tr></thead>
<tbody>
<tr><td>Grafana</td><td>10.2.0</td><td>Approved</td><td>Platform Team</td></tr>
<tr><td>Jenkins</td><td>2.426.3</td><td>Approved</td><td>DevOps</td></tr>
<tr><td>GitLab</td><td>16.8</td><td>Approved</td><td>Engineering</td></tr>
<tr><td>Prometheus</td><td>2.48</td><td>Approved</td><td>SRE</td></tr>
</tbody></table>
<p>Last reviewed: 2024-Q3. Contact IT governance for additions.</p>
</body></html>`);
});

// FP-19: Example Bearer tokens in API documentation
app.get('/api-docs', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>API Documentation</title></head>
<body>
<h1>REST API v2 Documentation</h1>
<h2>Authentication</h2>
<p>All requests require a Bearer token. Example:</p>
<pre>curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhhbXBsZV9vbmx5Ijp0cnVlfQ.example_signature_do_not_use" \\
  https://api.example.com/v2/users</pre>
<h2>API Keys</h2>
<p>You can also use API keys:</p>
<pre>curl -H "X-API-Key: sk_test_example_only_4eC39HqLyjWDarjtT1zdp7dc" \\
  https://api.example.com/v2/assets</pre>
<p><strong>Note:</strong> These are example values only. Generate your own keys in the Settings panel.</p>
</body></html>`);
});

// FP-20: Private IPs in educational content
app.get('/networking-guide', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Networking Fundamentals Guide</title></head>
<body>
<h1>Private IP Ranges Explained</h1>
<h2>RFC 1918 Address Space</h2>
<p>Private networks use reserved address ranges that are not routable on the public internet:</p>
<ul>
<li><strong>Class A:</strong> 10.0.0.0/8 — e.g. 10.0.0.5 is commonly used for internal services</li>
<li><strong>Class B:</strong> 172.16.0.0/12</li>
<li><strong>Class C:</strong> 192.168.0.0/16 — e.g. 192.168.1.1 is the default gateway for most home routers</li>
</ul>
<p>In a typical home network, 192.168.1.1 serves as the router's management interface.</p>
</body></html>`);
});

// FP-21: "Index of" in article title
app.get('/article/apache-hardening', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Index of Best Practices for Apache Security</title></head>
<body>
<h1>Index of Best Practices for Apache Security Hardening</h1>
<p>This article provides a comprehensive index of security hardening techniques for Apache HTTP Server deployments.</p>
<ol>
<li>Disable directory listing with <code>Options -Indexes</code></li>
<li>Remove Server header version information</li>
<li>Enable mod_security for WAF capabilities</li>
</ol>
</body></html>`);
});

// FP-22: Standard Server/X-Powered-By headers
app.get('/standard-headers', (req, res) => {
  res.set({
    'Server': 'nginx/1.25.3',
    'X-Powered-By': 'Express',
    'X-Request-Id': 'req-a1b2c3d4',
  });
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Standard Page</title></head>
<body><h1>Application Homepage</h1><p>Standard web application page.</p></body></html>`);
});

// FP-23: Missing security headers should be ONE grouped finding
app.get('/marketing', (req, res) => {
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('X-Frame-Options');
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Marketing Page</title></head>
<body><h1>Welcome to Our Platform</h1><p>Discover how we help enterprises manage their attack surface.</p></body></html>`);
});

// FP-24: Analytics cookies without Secure/HttpOnly are NOT a finding
// Also a TRUE POSITIVE: weak_session cookie IS a finding
app.get('/cookie-test', (req, res) => {
  res.cookie('_ga', 'GA1.2.1234567890.1234567890', { httpOnly: false, secure: false });
  res.cookie('_gid', 'GA1.2.9876543210.1234567890', { httpOnly: false, secure: false });
  res.cookie('locale', 'en-US', { httpOnly: false, secure: false });
  res.cookie('weak_session', 'sess_a1b2c3d4e5f6', { httpOnly: false, secure: false });
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Cookie Test</title></head>
<body><h1>Dashboard</h1><p>Your account settings.</p></body></html>`);
});

// FP-26: Standard libraries are not malicious deps
app.get('/app', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>SPA Application</title>
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body><div id="root"></div></body></html>`);
});

// FP-27: HTTP 200 on /manage is not access control weakness
app.get('/manage', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Manage Your Subscription</title></head>
<body>
<h1>Manage Your Subscription</h1>
<p>Sign in to manage your subscription, update billing details, or change your plan.</p>
<a href="/login">Sign in to continue</a>
</body></html>`);
});

// FP-28: Missing CORS is the safe default
app.get('/api/data', (req, res) => {
  res.json({ items: [{ id: 1, name: 'Widget A' }, { id: 2, name: 'Widget B' }], total: 2 });
});

// FP-31: HTTP 403 is NOT content served over HTTP
// Port 3019 listener that returns 403

// TRUE POSITIVE: Real internal IP leaked in error
app.get('/api/error', (req, res) => {
  res.status(500).json({
    error: 'Database connection failed',
    details: 'Could not connect to PostgreSQL at 10.42.0.15:5432 - connection refused',
    trace: 'at Pool.connect (/app/node_modules/pg/lib/pool.js:322:12)',
  });
});

// TRUE POSITIVE: Real directory listing with sensitive files
app.get('/files/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Index of /files/</title></head>
<body>
<h1>Index of /files/</h1>
<pre>
<a href="../">../</a>
<a href="backup.sql.gz">backup.sql.gz</a>           2024-09-10 03:15    45M
<a href="config.old">config.old</a>               2024-08-22 14:30    2.1K
<a href="app-v2.3.tar.gz">app-v2.3.tar.gz</a>          2024-09-01 09:00    12M
<a href="readme.txt">readme.txt</a>               2024-07-15 11:00    512
</pre>
<hr><address>nginx/1.24.0</address>
</body></html>`);
});

// TRUE POSITIVE: Debug token in header
app.get('/debug-endpoint', (req, res) => {
  res.set('X-Debug-Token', 'dbg_f8a92c3e-4b17-4d2a-9e86-1c3d5f7a8b90');
  res.set('X-Debug-Token-Link', '/_profiler/f8a92c3e');
  res.json({ status: 'ok', debug: true });
});

// TRUE POSITIVE: CORS wildcard with credentials
app.get('/api/sensitive', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.json({ user: { email: 'admin@soltrisk.local', role: 'admin' } });
});

// Main HTTPS listener
app.listen(3009, '0.0.0.0', () => {
  console.log('intentionally-benign target listening on port 3009');
});

// FP-31: HTTP listener returning 403 (hardened state)
const httpApp = express();
httpApp.use((req, res) => {
  res.status(403).type('html').send(`<!DOCTYPE html>
<html><head><title>403 Forbidden</title></head>
<body><h1>Forbidden</h1><p>HTTPS required.</p></body></html>`);
});
httpApp.listen(3019, '0.0.0.0', () => {
  console.log('intentionally-benign HTTP (403 hardened) on port 3019');
});
