const express = require('express');
const app = express();

const HOMEPAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>InfraWatch - Infrastructure Monitoring</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f6f8; }
    nav { background: #2b2b3d; color: #fff; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    nav .brand { font-size: 1.3rem; font-weight: 700; color: #e6522c; }
    nav a { color: #ccc; text-decoration: none; margin-left: 1.5rem; }
    .container { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    article { background: #fff; border-radius: 8px; padding: 2rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    h1 { font-size: 1.7rem; margin-bottom: 1rem; color: #2b2b3d; }
    h2 { font-size: 1.2rem; margin: 1.5rem 0 0.5rem; color: #444; }
    p { margin-bottom: 1rem; }
    footer { text-align: center; padding: 2rem; color: #888; font-size: 0.85rem; }
  </style>
</head>
<body>
  <nav>
    <span class="brand">InfraWatch</span>
    <div>
      <a href="/">Blog</a>
      <a href="/metrics">Metrics</a>
      <a href="/graph">Graph</a>
      <a href="/docs">Docs</a>
    </div>
  </nav>
  <div class="container">
    <article>
      <h1>Modern Approaches to Infrastructure Metrics Collection</h1>
      <p>Effective infrastructure monitoring starts with reliable prometheus metrics collection pipelines. Teams that invest in structured telemetry can reduce incident response times significantly and maintain higher service reliability.</p>
      <h2>Pull-Based vs Push-Based Collection</h2>
      <p>The prometheus model of pull-based metric scraping has become a de facto standard in cloud-native environments. By having the monitoring system pull metrics from instrumented endpoints, teams gain better control over scrape intervals and can detect target unavailability as a signal itself.</p>
      <h2>Metric Types and Best Practices</h2>
      <p>Understanding the four core metric types — counters, gauges, histograms, and summaries — is essential for building effective dashboards. Counters track cumulative values like total requests served, while gauges capture point-in-time measurements like current memory usage.</p>
      <p>When implementing prometheus-style exporters for your services, focus on capturing business-relevant metrics alongside infrastructure health indicators. This dual approach ensures that monitoring serves both operational and product needs.</p>
    </article>
  </div>
  <footer>&copy; 2024 InfraWatch Blog. All rights reserved.</footer>
</body>
</html>`;

function generateMetrics() {
  const uptime = Math.floor(process.uptime());
  const now = Date.now();
  return `# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total ${(uptime * 0.023).toFixed(2)}

# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes ${process.memoryUsage().rss}

# HELP process_virtual_memory_bytes Virtual memory size in bytes.
# TYPE process_virtual_memory_bytes gauge
process_virtual_memory_bytes ${process.memoryUsage().heapTotal + 52428800}

# HELP process_open_fds Number of open file descriptors.
# TYPE process_open_fds gauge
process_open_fds 12

# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.
# TYPE process_start_time_seconds gauge
process_start_time_seconds ${(now / 1000 - uptime).toFixed(2)}

# HELP go_goroutines Number of goroutines that currently exist.
# TYPE go_goroutines gauge
go_goroutines 42

# HELP go_threads Number of OS threads created.
# TYPE go_threads gauge
go_threads 14

# HELP http_requests_total Total number of HTTP requests.
# TYPE http_requests_total counter
http_requests_total{method="GET",handler="/",code="200"} ${1200 + Math.floor(Math.random() * 100)}
http_requests_total{method="GET",handler="/metrics",code="200"} ${850 + Math.floor(Math.random() * 50)}
http_requests_total{method="GET",handler="/api/v1/query",code="200"} ${340 + Math.floor(Math.random() * 30)}
http_requests_total{method="POST",handler="/api/v1/write",code="204"} ${5600 + Math.floor(Math.random() * 200)}

# HELP http_request_duration_seconds HTTP request latency in seconds.
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{handler="/",le="0.01"} 980
http_request_duration_seconds_bucket{handler="/",le="0.05"} 1150
http_request_duration_seconds_bucket{handler="/",le="0.1"} 1190
http_request_duration_seconds_bucket{handler="/",le="0.5"} 1200
http_request_duration_seconds_bucket{handler="/",le="1"} 1200
http_request_duration_seconds_bucket{handler="/",le="+Inf"} 1200
http_request_duration_seconds_sum{handler="/"} 18.42
http_request_duration_seconds_count{handler="/"} 1200

# HELP node_cpu_seconds_total Seconds the CPUs spent in each mode.
# TYPE node_cpu_seconds_total counter
node_cpu_seconds_total{cpu="0",mode="idle"} ${(uptime * 0.85).toFixed(2)}
node_cpu_seconds_total{cpu="0",mode="system"} ${(uptime * 0.08).toFixed(2)}
node_cpu_seconds_total{cpu="0",mode="user"} ${(uptime * 0.07).toFixed(2)}

# HELP node_memory_MemTotal_bytes Memory information field MemTotal_bytes.
# TYPE node_memory_MemTotal_bytes gauge
node_memory_MemTotal_bytes 8.35e+09

# HELP node_memory_MemAvailable_bytes Memory information field MemAvailable_bytes.
# TYPE node_memory_MemAvailable_bytes gauge
node_memory_MemAvailable_bytes 5.12e+09

# HELP node_filesystem_avail_bytes Filesystem space available to non-root users in bytes.
# TYPE node_filesystem_avail_bytes gauge
node_filesystem_avail_bytes{device="/dev/sda1",fstype="ext4",mountpoint="/"} 4.2e+10
`;
}

// FP-01/FP-15: Body text mentions "prometheus" in prose — NOT proof of Prometheus running
app.get('/', (req, res) => {
  res.type('html').send(HOMEPAGE);
});

// REAL VULN: /metrics is publicly accessible with no authentication
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(generateMetrics());
});

// FP-15: /graph returns same homepage (SPA catch-all trap)
app.get('/graph', (req, res) => {
  res.type('html').send(HOMEPAGE);
});

// Real Prometheus build info endpoint
app.get('/real/api/v1/status/buildinfo', (req, res) => {
  res.json({
    status: 'success',
    data: {
      version: '2.48.0',
      revision: 'a1b2c3d4e5f6',
      branch: 'HEAD',
      buildUser: 'root@builder',
      buildDate: '20231115-08:00:00',
      goVersion: 'go1.21.4',
    },
  });
});

app.get('/real/api/v1/query', (req, res) => {
  const query = req.query.query || 'up';
  res.json({
    status: 'success',
    data: {
      resultType: 'vector',
      result: [
        {
          metric: { __name__: query, instance: 'localhost:9090', job: 'prometheus' },
          value: [Math.floor(Date.now() / 1000), '1'],
        },
      ],
    },
  });
});

app.get('/real/metrics', (req, res) => {
  let metrics = generateMetrics();
  metrics += `
# HELP prometheus_build_info A metric with a constant '1' value labeled by version, revision, branch, goversion, builduser and builddate.
# TYPE prometheus_build_info gauge
prometheus_build_info{branch="HEAD",goversion="go1.21.4",revision="a1b2c3d4e5f6",version="2.48.0"} 1

# HELP prometheus_tsdb_head_chunks Total number of chunks in the head block.
# TYPE prometheus_tsdb_head_chunks gauge
prometheus_tsdb_head_chunks 12450

# HELP prometheus_tsdb_head_series Total number of series in the head block.
# TYPE prometheus_tsdb_head_series gauge
prometheus_tsdb_head_series 3200
`;
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metrics);
});

app.listen(3004, '0.0.0.0', () => {
  console.log('prometheus-like target listening on port 3004');
});
