const express = require('express');
const app = express();

const SPA_SHELL = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>InternalOps Dashboard</title>
  <link rel="stylesheet" href="/assets/app.css">
</head>
<body>
  <div id="root">
    <div class="loading-screen">
      <div class="spinner"></div>
      <p>Loading application...</p>
    </div>
  </div>
  <script type="module" src="/assets/app.bundle.js"></script>
</body>
</html>`;

// FP-10/FP-14: SPA catch-all — returns identical HTML for every path
// /admin, /login, /settings, /dashboard all return the same shell
app.get('/assets/app.css', (req, res) => {
  res.type('text/css').send(`
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #e0e0e0; }
    .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .spinner { width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #4a90d9; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `);
});

app.get('/assets/app.bundle.js', (req, res) => {
  res.type('application/javascript').send('// SPA bootstrap - client-side router');
});

// TRUE POSITIVE: Debug endpoint exposes environment variables
app.get('/debug/env', (req, res) => {
  res.json({
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://soltrisk:soltrisk_bench_2024@postgres:5432/soltrisk',
    JWT_SECRET: 'soltrisk-secret-key-2024',
    REDIS_URL: 'redis://redis:6379',
    AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
    AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    SMTP_PASSWORD: 'smtp_pass_f7g8h9',
    INTERNAL_API_KEY: 'iak_production_a1b2c3d4e5f6g7h8',
  });
});

// SPA catch-all: every other path returns the same shell
app.get('*', (req, res) => {
  res.type('html').send(SPA_SHELL);
});

app.listen(3010, '0.0.0.0', () => {
  console.log('admin-console target listening on port 3010');
});
