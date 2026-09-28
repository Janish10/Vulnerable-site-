const express = require('express');
const app = express();

const BLOG_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CloudOps Weekly - Monitoring Insights</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
    nav { background: #1a1a2e; color: #fff; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    nav a { color: #e0e0e0; text-decoration: none; margin-left: 1.5rem; }
    nav .brand { font-size: 1.3rem; font-weight: 700; }
    .container { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    article { background: #fff; border-radius: 8px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 1.8rem; margin-bottom: 1rem; color: #1a1a2e; }
    h2 { font-size: 1.3rem; margin: 1.5rem 0 0.5rem; color: #2d2d44; }
    p { margin-bottom: 1rem; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
    footer { text-align: center; padding: 2rem; color: #666; font-size: 0.85rem; }
  </style>
</head>
<body>
  <nav>
    <span class="brand">CloudOps Weekly</span>
    <div>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/login">Subscribe</a>
    </div>
  </nav>
  <div class="container">
    <article>
      <h1>Monitoring Best Practices for Cloud-Native Applications</h1>
      <p class="meta">Published on September 15, 2024 &middot; 8 min read</p>
      <p>Modern infrastructure monitoring has evolved significantly over the past decade. Tools like grafana have become essential for teams that need real-time visibility into their application performance. In this article, we explore the best practices for setting up comprehensive monitoring.</p>
      <h2>Choosing the Right Dashboard Solution</h2>
      <p>When evaluating dashboard platforms, organizations often consider grafana as part of their monitoring stack. The ability to create custom visualizations and connect to multiple data sources makes grafana dashboards particularly useful for DevOps teams managing microservices architectures.</p>
      <h2>Data Source Integration</h2>
      <p>One of the key advantages of modern monitoring tools is their ability to integrate with various data backends. Whether you are using Prometheus, InfluxDB, or Elasticsearch as your time-series database, having a unified view through grafana or similar platforms streamlines incident response workflows.</p>
      <h2>Alerting and On-Call Management</h2>
      <p>Effective alerting requires careful threshold configuration. Teams using grafana typically set up alert rules that balance sensitivity with noise reduction. The goal is to catch genuine incidents without overwhelming on-call engineers with false alarms.</p>
      <p>In our next article, we will cover advanced alerting patterns and how to integrate your monitoring stack with incident management platforms like PagerDuty and Opsgenie.</p>
    </article>
  </div>
  <footer>&copy; 2024 CloudOps Weekly. All rights reserved.</footer>
</body>
</html>`;

const GENERIC_LOGIN = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .login-card { background: #fff; padding: 2.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
    h1 { font-size: 1.5rem; text-align: center; margin-bottom: 1.5rem; color: #333; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.3rem; font-size: 0.9rem; color: #555; }
    input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
    input:focus { outline: none; border-color: #4a90d9; box-shadow: 0 0 0 2px rgba(74,144,217,0.2); }
    button { width: 100%; padding: 0.75rem; background: #4a90d9; color: #fff; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; margin-top: 0.5rem; }
    button:hover { background: #3a7bc8; }
    .footer-text { text-align: center; margin-top: 1rem; font-size: 0.85rem; color: #888; }
  </style>
</head>
<body>
  <div class="login-card">
    <h1>Sign in to your account</h1>
    <form method="POST" action="/login">
      <div class="form-group">
        <label for="username">Email or Username</label>
        <input type="text" id="username" name="username" placeholder="Enter your email" required>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="Enter your password" required>
      </div>
      <button type="submit">Sign In</button>
    </form>
    <p class="footer-text">Forgot your password? <a href="/reset">Reset it here</a></p>
  </div>
</body>
</html>`;

const ABOUT_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About - CloudOps Weekly</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
    nav { background: #1a1a2e; color: #fff; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    nav a { color: #e0e0e0; text-decoration: none; margin-left: 1.5rem; }
    nav .brand { font-size: 1.3rem; font-weight: 700; }
    .container { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    article { background: #fff; border-radius: 8px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 1.8rem; margin-bottom: 1rem; color: #1a1a2e; }
    p { margin-bottom: 1rem; }
    footer { text-align: center; padding: 2rem; color: #666; font-size: 0.85rem; }
  </style>
</head>
<body>
  <nav>
    <span class="brand">CloudOps Weekly</span>
    <div>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/login">Subscribe</a>
    </div>
  </nav>
  <div class="container">
    <article>
      <h1>Why Grafana Is Essential for Modern Infrastructure Teams</h1>
      <p>Organizations worldwide rely on grafana to visualize their operational data. From small startups to Fortune 500 companies, grafana dashboards provide the observability layer that engineering teams need to maintain reliable services.</p>
      <p>In our experience, teams that adopt grafana as part of their monitoring toolkit see a significant reduction in mean time to detection (MTTD) for production incidents. The platform's flexibility in connecting to diverse data sources means that grafana can serve as a single pane of glass for complex, multi-cloud environments.</p>
      <p>Whether you are tracking application latency, database performance, or Kubernetes cluster health, grafana provides the visualization capabilities needed to turn raw metrics into actionable insights.</p>
      <p>At CloudOps Weekly, we regularly feature articles about grafana configuration patterns, dashboard design principles, and integration strategies. Subscribe to our newsletter to stay current with the latest monitoring best practices.</p>
    </article>
  </div>
  <footer>&copy; 2024 CloudOps Weekly. All rights reserved.</footer>
</body>
</html>`;

const REAL_GRAFANA_LOGIN = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grafana</title>
  <link rel="icon" type="image/png" href="/public/img/fav32.png">
  <link rel="stylesheet" href="/public/build/grafana.dark.abc123.css">
  <link rel="stylesheet" href="/public/build/grafana.light.def456.css">
</head>
<body class="theme-dark">
  <div class="main-view">
    <div class="login-page">
      <div class="login-content">
        <div class="login-branding">
          <img class="login-logo" src="/public/img/grafana_icon.svg" alt="Grafana" />
          <div class="login-logo-text">Welcome to Grafana</div>
        </div>
        <form name="loginForm" class="login-form-group gf-form-group">
          <div class="login-form">
            <input type="text" name="user" class="gf-form-input login-form-input" placeholder="email or username" aria-label="Username input field" />
          </div>
          <div class="login-form">
            <input type="password" name="password" class="gf-form-input login-form-input" placeholder="password" aria-label="Password input field" />
          </div>
          <div class="login-button-group">
            <button type="submit" class="css-6ntnx5-button" aria-label="Login button">Log in</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <script src="/public/build/runtime.abc123.js"></script>
  <script src="/public/build/app.abc123.js"></script>
</body>
</html>`;

// FP-01: Word "grafana" in prose — NOT evidence of Grafana running
app.get('/', (req, res) => {
  res.type('html').send(BLOG_PAGE);
});

// FP-13: Generic login page — NOT a Grafana login
app.get('/login', (req, res) => {
  res.type('html').send(GENERIC_LOGIN);
});

app.post('/login', (req, res) => {
  res.status(401).type('html').send(GENERIC_LOGIN);
});

// FP-01: More prose about grafana
app.get('/about', (req, res) => {
  res.type('html').send(ABOUT_PAGE);
});

// FP-34: Behavioral probe fails without auth
app.get('/api/health', (req, res) => {
  res.status(401).json({ message: 'Unauthorized' });
});

// FP-36: REAL Grafana fingerprints — strong signals
app.get('/real/login', (req, res) => {
  res.set('X-Grafana-Version', '10.2.0');
  res.cookie('grafana_session', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', {
    httpOnly: true,
    path: '/',
  });
  res.type('html').send(REAL_GRAFANA_LOGIN);
});

app.get('/real/api/health', (req, res) => {
  res.set('X-Grafana-Version', '10.2.0');
  res.json({
    commit: 'abc123def456',
    database: 'ok',
    version: '10.2.0',
  });
});

app.get('/real/', (req, res) => {
  res.set('X-Grafana-Version', '10.2.0');
  res.redirect('/real/login');
});

// Static asset stubs for Grafana paths
app.get('/public/*', (req, res) => {
  res.status(200).type('text/css').send('/* grafana assets */');
});

app.listen(3001, '0.0.0.0', () => {
  console.log('grafana-like target listening on port 3001');
});
