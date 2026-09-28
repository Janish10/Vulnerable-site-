const express = require('express');

// FP-17: nginx 1.20.2 must NOT match CVEs for 1.2.x (prefix matching bug)
// TRUE POSITIVE: nginx 1.2.9 is genuinely deprecated

const oldApp = express();
const currentApp = express();

// nginx-old: TRUE POSITIVE — deprecated nginx 1.2.9
oldApp.use((req, res, next) => {
  res.set('Server', 'nginx/1.2.9');
  next();
});

oldApp.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Legacy Application</title></head>
<body>
<h1>Legacy Application Server</h1>
<p>This application runs on an older infrastructure stack.</p>
<p>For support, contact ops@internal.example.com.</p>
</body></html>`);
});

oldApp.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// nginx-current: FP-17 — version 1.20.2, must NOT match 1.2.x CVEs
currentApp.use((req, res, next) => {
  res.set('Server', 'nginx/1.20.2');
  next();
});

currentApp.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Application Platform</title></head>
<body>
<h1>Application Platform</h1>
<p>Modern application deployment platform running current nginx.</p>
</body></html>`);
});

// FP-18: Version string alone is NOT default configuration
currentApp.get('/default', (req, res) => {
  res.set('Server', 'nginx/1.24.0');
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Custom Application</title></head>
<body>
<h1>Custom Configured Application</h1>
<p>This server is fully configured with custom settings, not factory defaults.</p>
</body></html>`);
});

currentApp.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

oldApp.listen(3012, '0.0.0.0', () => {
  console.log('nginx-old (1.2.9) target listening on port 3012');
});

currentApp.listen(3013, '0.0.0.0', () => {
  console.log('nginx-current (1.20.2) target listening on port 3013');
});
