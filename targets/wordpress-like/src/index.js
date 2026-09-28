const express = require('express');
const app = express();

const WEAK_WP_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TechBlog - WordPress Development Tips</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; background: #f9f9f9; }
    nav { background: #23282d; color: #fff; padding: 0.8rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    nav .brand { font-size: 1.2rem; font-weight: 700; }
    nav a { color: #ccc; text-decoration: none; margin-left: 1.5rem; font-size: 0.9rem; }
    .container { max-width: 740px; margin: 2rem auto; padding: 0 1rem; }
    article { background: #fff; padding: 2.5rem; margin-bottom: 2rem; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #1a1a1a; }
    .meta { color: #888; font-size: 0.85rem; margin-bottom: 1.5rem; }
    p { margin-bottom: 1.2rem; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
    footer { text-align: center; padding: 2rem; color: #888; font-size: 0.85rem; }
  </style>
</head>
<body>
  <nav>
    <span class="brand">TechBlog</span>
    <div>
      <a href="/">Home</a>
      <a href="/category/wordpress">WordPress</a>
      <a href="/category/devops">DevOps</a>
      <a href="/about">About</a>
    </div>
  </nav>
  <div class="container">
    <article>
      <h1>Migrating from WordPress to a Headless CMS</h1>
      <p class="meta">By Sarah Chen &middot; September 10, 2024 &middot; 12 min read</p>
      <p>After running our company blog on WordPress for six years, we finally made the move to a headless architecture. This post documents our journey, the lessons we learned, and why WordPress served us well for so long.</p>
      <p>WordPress powers approximately 43% of all websites on the internet, making it the world's most popular content management system. Our wordpress installation handled over 50,000 monthly visitors without issues, but as our development team grew, we needed more flexibility in the frontend layer.</p>
      <p>The migration process involved exporting all wordpress content using the REST API, transforming the data into our new schema, and rebuilding the frontend with React. We kept the wordpress admin panel as a content editing interface during the transition period, giving our content team a familiar workflow while engineers worked on the new frontend.</p>
      <p>One challenge was preserving SEO rankings. Our wordpress site had accumulated significant domain authority, and we needed to ensure every URL redirect was properly configured. Tools like <code>wp-cli</code> made it easier to audit existing routes before cutover.</p>
      <p>If you are considering a similar migration, start by auditing your wordpress plugins. Many plugins add custom database tables and API endpoints that need equivalent functionality in your new stack.</p>
    </article>
  </div>
  <footer>&copy; 2024 TechBlog. Powered by Next.js</footer>
</body>
</html>`;

const SPA_CATCH_ALL = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebApp</title>
  <style>
    body { margin: 0; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; }
    .loading { text-align: center; }
    .spinner { width: 40px; height: 40px; border: 4px solid #eee; border-top: 4px solid #333; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p>Loading application...</p>
  </div>
  <script>
    // SPA router — all routes land here
    console.log('SPA route:', window.location.pathname);
  </script>
</body>
</html>`;

const NUCLEI_TRAP_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Version Info</title>
</head>
<body>
  <p>Build: wp-5.9.3-hotfix-2024</p>
  <p>Platform core version identifier: 5.9.3</p>
  <p>This is not a WordPress installation. The version string above is our internal build numbering scheme.</p>
  <p>Contact: admin@techblog.internal</p>
</body>
</html>`;

const REAL_WP_LOGIN = `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Log In &lsaquo; Meridian Corp &mdash; WordPress</title>
  <meta name="robots" content="max-image-preview:large, noindex, nofollow">
  <link rel="stylesheet" id="dashicons-css" href="/wp-includes/css/dashicons.min.css" type="text/css" media="all">
  <link rel="stylesheet" id="buttons-css" href="/wp-includes/css/buttons.min.css" type="text/css" media="all">
  <link rel="stylesheet" id="forms-css" href="/wp-admin/css/forms.min.css" type="text/css" media="all">
  <link rel="stylesheet" id="l10n-css" href="/wp-admin/css/l10n.min.css" type="text/css" media="all">
  <link rel="stylesheet" id="login-css" href="/wp-admin/css/login.min.css" type="text/css" media="all">
</head>
<body class="login js login-action-login wp-core-ui locale-en-us">
  <div id="login">
    <h1><a href="https://wordpress.org/">Powered by WordPress</a></h1>
    <form name="loginform" id="loginform" action="/real/wp-login.php" method="post">
      <p>
        <label for="user_login">Username or Email Address</label>
        <input type="text" name="log" id="user_login" class="input" value="" size="20" autocapitalize="off" autocomplete="username" required="required">
      </p>
      <p>
        <label for="user_pass">Password</label>
        <div class="wp-pwd">
          <input type="password" name="pwd" id="user_pass" class="input password-input" value="" size="20" autocomplete="current-password" spellcheck="false" required="required">
        </div>
      </p>
      <p class="forgetmenot">
        <input name="rememberme" type="checkbox" id="rememberme" value="forever">
        <label for="rememberme">Remember Me</label>
      </p>
      <p class="submit">
        <input type="submit" name="wp-submit" id="wp-submit" class="button button-primary button-large" value="Log In">
        <input type="hidden" name="redirect_to" value="/real/wp-admin/">
        <input type="hidden" name="testcookie" value="1">
      </p>
    </form>
    <p id="nav"><a href="/real/wp-login.php?action=lostpassword">Lost your password?</a></p>
    <p id="backtoblog"><a href="/real/">&larr; Go to Meridian Corp</a></p>
  </div>
  <div class="language-switcher"></div>
</body>
</html>`;

// FP-11: "wordpress" mentioned in prose only — weak signal
app.get('/weak/', (req, res) => {
  res.type('html').send(WEAK_WP_PAGE);
});

app.get('/weak/category/:cat', (req, res) => {
  res.type('html').send(WEAK_WP_PAGE);
});

// FP-10/FP-14: SPA catch-all — /wp-admin returns generic SPA, NOT WordPress
app.get('/spa/*', (req, res) => {
  res.type('html').send(SPA_CATCH_ALL);
});

// FP-09: Nuclei template trap — version string looks like WP but isn't
app.get('/nuclei-trap', (req, res) => {
  res.type('html').send(NUCLEI_TRAP_PAGE);
});

// FP-36: REAL WordPress fingerprints — strong signals
app.get('/real/', (req, res) => {
  res.set('X-Powered-By', 'PHP/8.1.27');
  res.set('Link', '</real/wp-json/>; rel="https://api.w.org/"');
  const html = `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Meridian Corp</title>
  <link rel="alternate" type="application/rss+xml" title="Meridian Corp Feed" href="/real/feed/">
  <link rel="EditURI" type="application/rsd+xml" title="RSD" href="/real/xmlrpc.php?rsd">
  <meta name="generator" content="WordPress 6.4.2">
  <link rel="stylesheet" id="wp-block-library-css" href="/real/wp-includes/css/dist/block-library/style.min.css" type="text/css" media="all">
</head>
<body class="home page-template-default page page-id-2 wp-custom-logo">
  <header id="masthead" class="site-header">
    <div class="site-branding"><h1 class="site-title"><a href="/real/">Meridian Corp</a></h1></div>
  </header>
  <main id="primary" class="site-main">
    <article id="post-2" class="post-2 page type-page status-publish hentry">
      <h2 class="entry-title">Welcome to Meridian Corp</h2>
      <div class="entry-content"><p>Building the future of enterprise solutions.</p></div>
    </article>
  </main>
  <footer class="site-footer"><p>Proudly powered by WordPress</p></footer>
</body>
</html>`;
  res.type('html').send(html);
});

app.get('/real/wp-login.php', (req, res) => {
  res.set('X-Powered-By', 'PHP/8.1.27');
  res.cookie('wordpress_test_cookie', 'WP%20Cookie%20check', { path: '/' });
  res.type('html').send(REAL_WP_LOGIN);
});

app.post('/real/wp-login.php', (req, res) => {
  res.status(200).set('X-Powered-By', 'PHP/8.1.27');
  res.type('html').send(REAL_WP_LOGIN);
});

app.get('/real/wp-json/', (req, res) => {
  res.set('X-Powered-By', 'PHP/8.1.27');
  res.json({
    name: 'Meridian Corp',
    description: 'Building the future of enterprise solutions',
    url: '/real',
    home: '/real',
    gmt_offset: '0',
    timezone_string: 'UTC',
    namespaces: ['oembed/1.0', 'wp/v2'],
    authentication: {},
    routes: {
      '/wp/v2': { namespace: 'wp/v2', methods: ['GET'] },
      '/wp/v2/posts': { namespace: 'wp/v2', methods: ['GET', 'POST'] },
      '/wp/v2/pages': { namespace: 'wp/v2', methods: ['GET', 'POST'] },
      '/wp/v2/users': { namespace: 'wp/v2', methods: ['GET', 'POST'] },
      '/wp/v2/media': { namespace: 'wp/v2', methods: ['GET', 'POST'] },
    },
    _links: { help: [{ href: 'https://developer.wordpress.org/rest-api/' }] },
  });
});

app.get('/real/wp-json/wp/v2/users', (req, res) => {
  res.set('X-Powered-By', 'PHP/8.1.27');
  res.json([
    { id: 1, name: 'admin', slug: 'admin', link: '/real/author/admin/', avatar_urls: {} },
    { id: 2, name: 'editor', slug: 'editor', link: '/real/author/editor/', avatar_urls: {} },
  ]);
});

app.get('/real/xmlrpc.php', (req, res) => {
  res.set('X-Powered-By', 'PHP/8.1.27');
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<methodResponse><params><param><value><string>XML-RPC server accepts POST requests only.</string></value></param></params></methodResponse>`);
});

app.get('/real/readme.html', (req, res) => {
  res.type('html').send(`<!DOCTYPE html><html><head><title>WordPress &rsaquo; ReadMe</title></head><body>
<h1 id="logo"><a href="https://wordpress.org/"><img alt="WordPress" src="wp-admin/images/wordpress-logo.png" /></a></h1>
<p>Version 6.4.2</p></body></html>`);
});

// Static asset stubs
app.get('/wp-includes/*', (req, res) => {
  if (req.path.endsWith('.css')) res.type('text/css').send('/* wp */');
  else res.type('application/javascript').send('// wp');
});

app.get('/wp-admin/*', (req, res) => {
  if (req.path.endsWith('.css')) res.type('text/css').send('/* wp admin */');
  else res.type('application/javascript').send('// wp admin');
});

app.listen(3005, '0.0.0.0', () => {
  console.log('wordpress-like target listening on port 3005');
});
