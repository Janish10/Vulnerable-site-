const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CERT_DIR = '/app/certs';

const CERT_PAGE = `<!DOCTYPE html>
<html><head><title>Certificate Test Service</title></head>
<body>
<h1>Certificate Validation Testing</h1>
<p>This service exposes multiple TLS configurations for testing certificate validation logic.</p>
<ul>
<li>Port 3014: Valid self-signed certificate (CN=certs.krizznaa.tech)</li>
<li>Port 3015: Intentionally unreachable HTTPS (FP-29 trap)</li>
<li>Port 3016: Wrong hostname certificate (CN=wrong.example.com)</li>
</ul>
</body></html>`;

// Port 3014: Valid self-signed HTTPS + HTTP serving content (FP-30: same fact, report once)
const app3014 = express();
app3014.get('/', (req, res) => {
  res.type('html').send(CERT_PAGE);
});
app3014.get('/health', (req, res) => {
  res.json({ status: 'ok', tls: true });
});

try {
  const validOpts = {
    key: fs.readFileSync(path.join(CERT_DIR, 'valid.key')),
    cert: fs.readFileSync(path.join(CERT_DIR, 'valid.crt')),
  };
  https.createServer(validOpts, app3014).listen(3014, '0.0.0.0', () => {
    console.log('certificate-targets HTTPS (valid) on port 3014');
  });
} catch (e) {
  console.log('Cert files not found, starting HTTP-only on 3014');
  app3014.listen(3014, '0.0.0.0');
}

// Also serve on HTTP — TRUE POSITIVE: content served over both HTTP and HTTPS
const httpApp = express();
httpApp.get('/', (req, res) => {
  res.type('html').send(CERT_PAGE);
});
httpApp.get('/health', (req, res) => {
  res.json({ status: 'ok', tls: false });
});
http.createServer(httpApp).listen(3015, '0.0.0.0', () => {
  console.log('certificate-targets HTTP (cleartext content) on port 3015');
});

// Port 3016: Wrong hostname cert
const app3016 = express();
app3016.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Wrong Hostname Cert</title></head>
<body><h1>Service with mismatched certificate</h1><p>CN=wrong.example.com but served on certs.krizznaa.tech.</p></body></html>`);
});

try {
  const wrongOpts = {
    key: fs.readFileSync(path.join(CERT_DIR, 'wrong.key')),
    cert: fs.readFileSync(path.join(CERT_DIR, 'wrong.crt')),
  };
  https.createServer(wrongOpts, app3016).listen(3016, '0.0.0.0', () => {
    console.log('certificate-targets HTTPS (wrong hostname) on port 3016');
  });
} catch (e) {
  console.log('Wrong cert files not found, skipping port 3016');
}
