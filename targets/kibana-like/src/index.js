const express = require('express');
const app = express();

const GENERIC_DASHBOARD = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analytics Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #e0e0e0; }
    nav { background: #16213e; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2a2a4a; }
    nav .brand { font-size: 1.2rem; font-weight: 700; color: #00d4ff; }
    nav a { color: #aaa; text-decoration: none; margin-left: 1.5rem; font-size: 0.9rem; }
    .container { max-width: 1100px; margin: 2rem auto; padding: 0 1rem; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: #16213e; padding: 1.5rem; border-radius: 8px; border: 1px solid #2a2a4a; }
    .stat-card h3 { font-size: 0.85rem; color: #888; margin-bottom: 0.5rem; text-transform: uppercase; }
    .stat-card .value { font-size: 2rem; font-weight: 700; color: #00d4ff; }
    .panel { background: #16213e; padding: 1.5rem; border-radius: 8px; border: 1px solid #2a2a4a; margin-bottom: 1rem; }
    .panel h2 { font-size: 1.1rem; margin-bottom: 1rem; color: #ccc; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.6rem; text-align: left; border-bottom: 1px solid #2a2a4a; font-size: 0.9rem; }
    th { color: #888; font-weight: 600; }
  </style>
</head>
<body>
  <nav>
    <span class="brand">DataView Analytics</span>
    <div>
      <a href="/">Dashboard</a>
      <a href="/discover">Discover</a>
      <a href="/visualize">Visualize</a>
      <a href="/settings">Settings</a>
    </div>
  </nav>
  <div class="container">
    <div class="stats">
      <div class="stat-card"><h3>Total Events</h3><div class="value">1.2M</div></div>
      <div class="stat-card"><h3>Active Sources</h3><div class="value">47</div></div>
      <div class="stat-card"><h3>Avg Latency</h3><div class="value">42ms</div></div>
      <div class="stat-card"><h3>Error Rate</h3><div class="value">0.03%</div></div>
    </div>
    <div class="panel">
      <h2>Recent Events</h2>
      <table>
        <thead><tr><th>Timestamp</th><th>Source</th><th>Level</th><th>Message</th></tr></thead>
        <tbody>
          <tr><td>2024-09-15 14:22:01</td><td>web-api</td><td>INFO</td><td>Request processed successfully</td></tr>
          <tr><td>2024-09-15 14:21:58</td><td>auth-svc</td><td>WARN</td><td>Rate limit approaching threshold</td></tr>
          <tr><td>2024-09-15 14:21:55</td><td>worker-3</td><td>INFO</td><td>Batch job completed: 1500 records</td></tr>
          <tr><td>2024-09-15 14:21:50</td><td>db-proxy</td><td>INFO</td><td>Connection pool at 60% capacity</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

const GENERIC_APP_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f2f5; }
    .card { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 500px; }
    h1 { margin-bottom: 1rem; color: #333; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome</h1>
    <p>This application is loading. Please wait while components initialize.</p>
  </div>
</body>
</html>`;

const REAL_KIBANA_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elastic</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; background: #1D1E24; color: #DFE5EF; }
  </style>
  <link rel="stylesheet" href="/bundles/kbn-ui-shared-deps-src/kbn-ui-shared-deps-src.css">
  <link rel="stylesheet" href="/bundles/core/core.entry.css">
  <link rel="stylesheet" href="/node_modules/@kbn/ui-framework/dist/kui_dark.css">
</head>
<body>
  <kbn-csp data="script-src 'unsafe-eval' 'self'"></kbn-csp>
  <kbn-injected-metadata data="{}"></kbn-injected-metadata>
  <div class="kbnWelcomeView" id="kbn_loading_message" style="display:none">
    <div class="kbnLoaderWrap">
      <div class="kbnWelcomeText">Loading Elastic</div>
    </div>
  </div>
  <div class="kibanaWelcomeView" id="kibana-body"></div>
  <script src="/bundles/kbn-ui-shared-deps-src/kbn-ui-shared-deps-src.js"></script>
  <script src="/bundles/core/core.entry.js"></script>
</body>
</html>`;

// FP-03: "sid" is a generic session cookie, NOT proof of Kibana
app.get('/', (req, res) => {
  res.cookie('sid', 'Fe26.2**abc123def456789', {
    httpOnly: true,
    path: '/',
  });
  res.type('html').send(GENERIC_DASHBOARD);
});

// FP-15: Probe URL returns 200 but is NOT Kibana
app.get('/app/kibana', (req, res) => {
  res.type('html').send(GENERIC_APP_PAGE);
});

// FP-15: Generic status endpoint, not Kibana-specific
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.1.0',
    uptime: 86400,
    connections: { active: 12, total: 340 },
  });
});

// FP-36: REAL Kibana fingerprints — strong signals
app.get('/real/', (req, res) => {
  res.set('kbn-name', 'kibana');
  res.set('kbn-version', '8.11.1');
  res.set('kbn-license-sig', 'abc123signature');
  res.type('html').send(REAL_KIBANA_PAGE);
});

app.get('/real/api/status', (req, res) => {
  res.set('kbn-name', 'kibana');
  res.set('kbn-version', '8.11.1');
  res.json({
    name: 'kibana',
    uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    version: {
      number: '8.11.1',
      build_hash: 'abc123def456',
      build_number: 68024,
      build_snapshot: false,
    },
    status: {
      overall: { level: 'available', summary: 'All services are available' },
      core: {
        elasticsearch: { level: 'available', summary: 'Elasticsearch is available' },
        savedObjects: { level: 'available', summary: 'SavedObjects service has completed migrations' },
      },
    },
    metrics: {
      last_updated: '2024-09-15T14:22:01.000Z',
      collection_interval_in_millis: 5000,
    },
  });
});

app.get('/real/app/kibana', (req, res) => {
  res.set('kbn-name', 'kibana');
  res.set('kbn-version', '8.11.1');
  res.type('html').send(REAL_KIBANA_PAGE);
});

// Kibana bundle stubs
app.get('/bundles/*', (req, res) => {
  if (req.path.endsWith('.css')) {
    res.type('text/css').send('/* kibana bundle */');
  } else {
    res.type('application/javascript').send('// kibana bundle');
  }
});

app.listen(3003, '0.0.0.0', () => {
  console.log('kibana-like target listening on port 3003');
});
