const express = require('express');
const app = express();

const TEAM_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Our Team - Meridian Systems</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
    nav { background: #2c3e50; color: #fff; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    nav a { color: #ecf0f1; text-decoration: none; margin-left: 1.5rem; }
    nav .brand { font-size: 1.3rem; font-weight: 700; }
    .container { max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 2rem; text-align: center; margin-bottom: 2rem; color: #2c3e50; }
    .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
    .member { background: #fff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
    .member h3 { color: #2c3e50; margin-bottom: 0.3rem; }
    .member .role { color: #7f8c8d; font-size: 0.9rem; margin-bottom: 0.8rem; }
    .member p { font-size: 0.9rem; color: #555; text-align: left; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; background: #3498db; color: #fff; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.8rem; font-weight: 700; }
    footer { text-align: center; padding: 2rem; color: #666; font-size: 0.85rem; border-top: 1px solid #eee; margin-top: 3rem; }
  </style>
</head>
<body>
  <nav>
    <span class="brand">Meridian Systems</span>
    <div>
      <a href="/">Home</a>
      <a href="/team">Team</a>
      <a href="/careers">Careers</a>
      <a href="/contact">Contact</a>
    </div>
  </nav>
  <div class="container">
    <h1>Meet Our Team</h1>
    <div class="team-grid">
      <div class="member">
        <div class="avatar">HM</div>
        <h3>Hudson Martinez</h3>
        <p class="role">Senior DevOps Engineer</p>
        <p>Hudson manages our CI/CD pipeline and has been instrumental in reducing deployment times by 70%. With over 12 years of experience in systems engineering, Hudson brings deep expertise in container orchestration and infrastructure automation. Before joining Meridian, Hudson led the platform team at Datastream Analytics.</p>
      </div>
      <div class="member">
        <div class="avatar">SK</div>
        <h3>Sarah Kim</h3>
        <p class="role">VP of Engineering</p>
        <p>Sarah oversees all engineering operations and drives our technical strategy. She previously held leadership roles at three enterprise SaaS companies and is known for building high-performing distributed teams.</p>
      </div>
      <div class="member">
        <div class="avatar">JR</div>
        <h3>James Rodriguez</h3>
        <p class="role">Lead Backend Developer</p>
        <p>James architects our core platform services and mentors junior developers. He specializes in distributed systems design and has contributed to several open-source projects in the observability space.</p>
      </div>
      <div class="member">
        <div class="avatar">LP</div>
        <h3>Lisa Park</h3>
        <p class="role">Security Engineer</p>
        <p>Lisa leads our application security program including penetration testing, threat modeling, and secure development practices. She holds OSCP and CISSP certifications.</p>
      </div>
    </div>
  </div>
  <footer>&copy; 2024 Meridian Systems Inc. All rights reserved.</footer>
</body>
</html>`;

const JAVA_APP_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enterprise Portal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f4; }
    header { background: #34495e; color: #fff; padding: 1rem 2rem; }
    header h1 { font-size: 1.2rem; }
    .content { max-width: 800px; margin: 2rem auto; padding: 1.5rem; background: #fff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h2 { margin-bottom: 1rem; color: #2c3e50; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table th, .info-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee; }
    .info-table th { background: #f8f9fa; color: #555; font-weight: 600; }
    .status { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 0.85rem; }
    .status-active { background: #d4edda; color: #155724; }
  </style>
</head>
<body>
  <header><h1>Enterprise Resource Portal</h1></header>
  <div class="content">
    <h2>System Status</h2>
    <table class="info-table">
      <tr><th>Service</th><th>Status</th><th>Uptime</th></tr>
      <tr><td>Application Server</td><td><span class="status status-active">Active</span></td><td>99.98%</td></tr>
      <tr><td>Database Cluster</td><td><span class="status status-active">Active</span></td><td>99.99%</td></tr>
      <tr><td>Cache Layer</td><td><span class="status status-active">Active</span></td><td>99.95%</td></tr>
      <tr><td>Message Queue</td><td><span class="status status-active">Active</span></td><td>99.97%</td></tr>
    </table>
  </div>
</body>
</html>`;

const REAL_JENKINS_LOGIN = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in [Jenkins]</title>
  <link rel="stylesheet" href="/static/abc123/jsbundles/styles.css" type="text/css">
  <link rel="icon" href="/static/abc123/favicon.ico" type="image/x-icon">
  <script src="/static/abc123/scripts/prototype.js"></script>
</head>
<body id="jenkins" class="yui-skin-sam jenkins-2.426.3">
  <div id="page-head">
    <div id="header">
      <div class="logo"><img src="/static/abc123/images/svgs/logo.svg" alt="Jenkins" id="jenkins-head-icon" /></div>
    </div>
  </div>
  <div id="page-body">
    <div id="main-panel">
      <form name="login" method="post" action="/j_spring_security_check">
        <table>
          <tr>
            <td>User:</td>
            <td><input type="text" name="j_username" id="j_username" autofocus="true"></td>
          </tr>
          <tr>
            <td>Password:</td>
            <td><input type="password" name="j_password"></td>
          </tr>
          <tr>
            <td colspan="2">
              <input type="checkbox" id="remember_me" name="remember_me">
              <label for="remember_me">Remember me on this computer</label>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <input type="submit" name="Submit" value="Sign in">
              <input type="hidden" name="from" value="/">
            </td>
          </tr>
        </table>
      </form>
    </div>
  </div>
  <footer><div class="container-fluid"><p class="jenkins-version">Jenkins ver. 2.426.3</p></div></footer>
</body>
</html>`;

// FP-02: "Hudson" is a person's name, NOT Jenkins/Hudson CI
app.get('/', (req, res) => {
  res.type('html').send(TEAM_PAGE);
});

app.get('/team', (req, res) => {
  res.type('html').send(TEAM_PAGE);
});

// FP-03: JSESSIONID cookie is generic Java servlet, NOT Jenkins
app.get('/java-app', (req, res) => {
  res.cookie('JSESSIONID', 'A1B2C3D4E5F6A7B8C9D0E1F2.node01', {
    httpOnly: true,
    path: '/',
  });
  res.type('html').send(JAVA_APP_PAGE);
});

// FP-36: REAL Jenkins fingerprints — strong signals
app.get('/real/', (req, res) => {
  res.set('X-Jenkins', '2.426.3');
  res.set('X-Hudson', '1.395');
  res.set('X-Jenkins-Session', 'e4d5c6a7');
  res.set('X-Instance-Identity', 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA');
  res.redirect('/real/login');
});

app.get('/real/login', (req, res) => {
  res.set('X-Jenkins', '2.426.3');
  res.set('X-Hudson', '1.395');
  res.set('X-Jenkins-Session', 'e4d5c6a7');
  res.cookie('JSESSIONID', '5E8F3A2B1C0D9E8F.jenkins-node01', {
    httpOnly: true,
    path: '/',
  });
  res.type('html').send(REAL_JENKINS_LOGIN);
});

// FP-34: Behavioral probe — crumb endpoint works for real Jenkins
app.get('/real/crumbIssuer/api/json', (req, res) => {
  res.set('X-Jenkins', '2.426.3');
  res.set('X-Hudson', '1.395');
  res.json({
    _class: 'hudson.security.csrf.DefaultCrumbIssuer',
    crumb: 'abc123def456789ghijklmnop',
    crumbRequestField: '.crumb',
  });
});

// Real Jenkins API root
app.get('/real/api/json', (req, res) => {
  res.set('X-Jenkins', '2.426.3');
  res.set('X-Hudson', '1.395');
  res.json({
    _class: 'hudson.model.Hudson',
    assignedLabels: [{ name: 'built-in' }],
    mode: 'NORMAL',
    nodeDescription: 'the Jenkins controller',
    numExecutors: 2,
    primaryView: { _class: 'hudson.model.AllView', name: 'all', url: '/real/' },
    useCrumbs: true,
    useSecurity: true,
    views: [
      { _class: 'hudson.model.AllView', name: 'all', url: '/real/view/all/' },
    ],
  });
});

// Static asset stubs for Jenkins paths
app.get('/static/*', (req, res) => {
  res.status(200).type('application/javascript').send('// jenkins assets');
});

app.listen(3002, '0.0.0.0', () => {
  console.log('jenkins-like target listening on port 3002');
});
