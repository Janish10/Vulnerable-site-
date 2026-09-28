const express = require('express');
const app = express();

// FP-06: Weak Angular evidence (ng-app, ng-controller) without ng-version
const WEAK_ANGULAR = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Legacy Dashboard</title>
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>
  <style>body { font-family: sans-serif; padding: 2rem; }</style>
</head>
<body ng-app="legacyApp">
  <div ng-controller="MainCtrl">
    <h1>Internal Dashboard</h1>
    <p>Welcome, {{username}}</p>
    <ul>
      <li ng-repeat="item in items">{{item.name}} - {{item.status}}</li>
    </ul>
  </div>
  <script>
    angular.module('legacyApp', []).controller('MainCtrl', function($scope) {
      $scope.username = 'Guest';
      $scope.items = [{name: 'Server A', status: 'OK'}, {name: 'Server B', status: 'Warning'}];
    });
  </script>
</body>
</html>`;

// FP-36: Strong Angular fingerprint with ng-version attribute
const REAL_ANGULAR = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Angular Application</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="stylesheet" href="styles.abc123.css" media="print" onload="this.media='all'">
</head>
<body>
  <app-root ng-version="17.0.0">
    <div class="app-loading">
      <div class="logo"></div>
      <svg class="spinner">
        <circle cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke="#4a90d9"></circle>
      </svg>
    </div>
  </app-root>
  <script src="runtime.abc123.js" type="module"></script>
  <script src="polyfills.abc123.js" type="module"></script>
  <script src="main.abc123.js" type="module"></script>
</body>
</html>`;

app.get('/weak', (req, res) => {
  res.type('html').send(WEAK_ANGULAR);
});

app.get('/real', (req, res) => {
  res.type('html').send(REAL_ANGULAR);
});

app.get('/', (req, res) => {
  res.type('html').send(WEAK_ANGULAR);
});

app.get('/runtime.abc123.js', (req, res) => {
  res.type('application/javascript').send('// Angular runtime');
});
app.get('/polyfills.abc123.js', (req, res) => {
  res.type('application/javascript').send('// Polyfills');
});
app.get('/main.abc123.js', (req, res) => {
  res.type('application/javascript').send('// Main application');
});
app.get('/styles.abc123.css', (req, res) => {
  res.type('text/css').send('body { font-family: sans-serif; }');
});

app.listen(3008, '0.0.0.0', () => {
  console.log('angular-app target listening on port 3008');
});
