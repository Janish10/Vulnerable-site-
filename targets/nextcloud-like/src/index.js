const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

// FP-07: Generic JSON version field is NOT Nextcloud
app.get('/status', (req, res) => {
  res.json({
    service: 'inventory-api',
    version: '2.1.0',
    uptime: '14d 6h 23m',
    database: 'connected',
  });
});

app.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Cloud File Storage</title></head>
<body>
<h1>CloudStore - Enterprise File Sharing</h1>
<p>Secure file storage and collaboration platform.</p>
<a href="/login">Sign In</a>
</body></html>`);
});

app.get('/login', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Sign In - CloudStore</title></head>
<body>
<h1>Sign In</h1>
<form method="POST" action="/login">
<input type="text" name="user" placeholder="Username"><br>
<input type="password" name="password" placeholder="Password"><br>
<button type="submit">Log In</button>
</form>
</body></html>`);
});

// FP-36: REAL Nextcloud fingerprint — strong signals
app.get('/real/status.php', (req, res) => {
  res.cookie('oc_sessionPassphrase', 'a1b2c3d4e5f6g7h8i9j0', {
    httpOnly: true,
    path: '/',
  });
  res.cookie('nc_sameSiteCookielax', 'true', { path: '/' });
  res.cookie('nc_sameSiteCookiestrict', 'true', { path: '/' });
  res.json({
    installed: true,
    maintenance: false,
    needsDbUpgrade: false,
    version: '28.0.1.1',
    versionstring: '28.0.1',
    edition: '',
    productname: 'Nextcloud',
    extendedSupport: false,
  });
});

app.get('/real/', (req, res) => {
  res.set('X-Nextcloud-Version', '28.0.1');
  res.cookie('oc_sessionPassphrase', 'a1b2c3d4e5f6g7h8i9j0', {
    httpOnly: true,
    path: '/',
  });
  res.redirect('/real/login');
});

app.get('/real/login', (req, res) => {
  res.set('X-Nextcloud-Version', '28.0.1');
  res.type('html').send(`<!DOCTYPE html>
<html data-locale="en"><head>
<meta charset="UTF-8">
<title>Nextcloud</title>
<meta name="apple-itunes-app" content="app-id=1125420102">
<link rel="icon" href="/core/img/favicon.ico">
</head>
<body id="body-login">
<div id="login">
<div class="logo"><img src="/core/img/logo/logo.svg" alt="Nextcloud"></div>
<form method="POST" name="login" action="/login">
<fieldset>
<input type="text" name="user" id="user" placeholder="Username or email" autofocus>
<input type="password" name="password" id="password" placeholder="Password">
<input type="submit" id="submit-form" class="login primary" value="Log in">
</fieldset>
</form>
</div>
</body></html>`);
});

app.listen(3007, '0.0.0.0', () => {
  console.log('nextcloud-like target listening on port 3007');
});
