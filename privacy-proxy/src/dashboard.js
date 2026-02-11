/**
 * Dashboard Server
 * 
 * Provides a web-based dashboard for:
 * - Viewing real-time statistics
 * - Configuring privacy features
 * - Viewing block logs
 * - Managing blocklists
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class Dashboard {
  constructor(config, blocklist, logger) {
    this.config = config;
    this.blocklist = blocklist;
    this.logger = logger;
    this.app = express();
    
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../dashboard')));
  }
  
  setupRoutes() {
    // Serve dashboard HTML
    this.app.get('/', (req, res) => {
      res.send(this.getDashboardHTML());
    });
    
    // API: Get stats
    this.app.get('/api/stats', (req, res) => {
      res.json({
        ...this.stats,
        uptime: Math.round((Date.now() - this.stats.startTime) / 1000),
        blocklist: this.blocklist.getStats()
      });
    });
    
    // API: Get config
    this.app.get('/api/config', (req, res) => {
      res.json(this.config.features);
    });
    
    // API: Update config
    this.app.post('/api/config', (req, res) => {
      Object.assign(this.config.features, req.body);
      res.json({ success: true, features: this.config.features });
    });
    
    // API: Get logs
    this.app.get('/api/logs', (req, res) => {
      const { category, limit = 100 } = req.query;
      res.json(this.logger.getLogs({ category, limit: parseInt(limit) }));
    });
    
    // API: Clear logs
    this.app.post('/api/logs/clear', (req, res) => {
      this.logger.clear();
      res.json({ success: true });
    });
    
    // API: Add domain to blocklist
    this.app.post('/api/blocklist/add', (req, res) => {
      const { category, domain } = req.body;
      if (category && domain) {
        this.blocklist.addDomain(category, domain);
        res.json({ success: true });
      } else {
        res.status(400).json({ error: 'Missing category or domain' });
      }
    });
    
    // API: Remove domain from blocklist
    this.app.post('/api/blocklist/remove', (req, res) => {
      const { category, domain } = req.body;
      if (category && domain) {
        this.blocklist.removeDomain(category, domain);
        res.json({ success: true });
      } else {
        res.status(400).json({ error: 'Missing category or domain' });
      }
    });
    
    // API: Export logs
    this.app.get('/api/logs/export', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=privacy-logs.json');
      res.send(this.logger.export());
    });
  }
  
  start(port, stats) {
    this.stats = stats;
    this.app.listen(port);
  }
  
  getDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Haven Privacy Proxy - Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --midnight: #0D1B2A;
      --deep-slate: #1B263B;
      --shadow-blue: #415A77;
      --steel-blue: #778DA9;
      --fog: #A3B1C6;
      --ghost-white: #E0E1DD;
      --success: #2ECC71;
      --warning: #F1C40F;
      --error: #E74C3C;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, var(--midnight), var(--deep-slate));
      color: var(--ghost-white);
      min-height: 100vh;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0;
      border-bottom: 1px solid var(--shadow-blue);
      margin-bottom: 30px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--shadow-blue), var(--steel-blue));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    
    .logo h1 {
      font-size: 24px;
      font-weight: 600;
    }
    
    .logo span {
      color: var(--steel-blue);
      font-size: 14px;
    }
    
    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(46, 204, 113, 0.1);
      border: 1px solid var(--success);
      border-radius: 20px;
      color: var(--success);
      font-size: 14px;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      background: var(--success);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .card {
      background: rgba(27, 38, 59, 0.8);
      border: 1px solid var(--shadow-blue);
      border-radius: 12px;
      padding: 20px;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    
    .card-title {
      font-size: 14px;
      color: var(--steel-blue);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .stat-value {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .stat-label {
      color: var(--fog);
      font-size: 14px;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    
    .feature-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: rgba(65, 90, 119, 0.2);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .feature-toggle:hover {
      background: rgba(65, 90, 119, 0.4);
    }
    
    .feature-name {
      font-size: 14px;
    }
    
    .toggle-switch {
      width: 44px;
      height: 24px;
      background: var(--shadow-blue);
      border-radius: 12px;
      position: relative;
      transition: background 0.2s;
    }
    
    .toggle-switch.active {
      background: var(--success);
    }
    
    .toggle-switch::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
    }
    
    .toggle-switch.active::after {
      transform: translateX(20px);
    }
    
    .logs-container {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .log-entry {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border-bottom: 1px solid rgba(65, 90, 119, 0.3);
    }
    
    .log-entry:last-child {
      border-bottom: none;
    }
    
    .log-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }
    
    .log-icon.block { background: rgba(231, 76, 60, 0.2); color: var(--error); }
    .log-icon.pii { background: rgba(155, 89, 182, 0.2); color: #9B59B6; }
    .log-icon.upgrade { background: rgba(46, 204, 113, 0.2); color: var(--success); }
    .log-icon.info { background: rgba(52, 152, 219, 0.2); color: #3498DB; }
    
    .log-content {
      flex: 1;
      min-width: 0;
    }
    
    .log-action {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .log-details {
      font-size: 12px;
      color: var(--fog);
      word-break: break-all;
    }
    
    .log-time {
      font-size: 12px;
      color: var(--steel-blue);
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, var(--shadow-blue), var(--steel-blue));
      color: white;
    }
    
    .btn-primary:hover {
      filter: brightness(1.1);
    }
    
    .btn-danger {
      background: rgba(231, 76, 60, 0.2);
      color: var(--error);
      border: 1px solid var(--error);
    }
    
    .btn-danger:hover {
      background: rgba(231, 76, 60, 0.3);
    }
    
    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--steel-blue);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <div class="logo-icon">🛡️</div>
        <div>
          <h1>Haven Privacy Proxy</h1>
          <span>Local protection, zero cloud</span>
        </div>
      </div>
      <div class="status-badge">
        <div class="status-dot"></div>
        <span>Proxy Active</span>
      </div>
    </header>
    
    <div class="grid">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Total Requests</span>
        </div>
        <div class="stat-value" id="stat-total">0</div>
        <div class="stat-label">Since proxy started</div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-title">Blocked</span>
        </div>
        <div class="stat-value" id="stat-blocked" style="color: var(--error)">0</div>
        <div class="stat-label">Trackers, ads, threats</div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-title">PII Protected</span>
        </div>
        <div class="stat-value" id="stat-pii" style="color: #9B59B6">0</div>
        <div class="stat-label">Sensitive data blocked</div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-title">HTTPS Upgraded</span>
        </div>
        <div class="stat-value" id="stat-https" style="color: var(--success)">0</div>
        <div class="stat-label">Connections secured</div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 30px;">
      <div class="card-header">
        <span class="card-title">Privacy Features</span>
      </div>
      <div class="features-grid" id="features">
        <!-- Features loaded dynamically -->
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <span class="card-title">Activity Log</span>
        <button class="btn btn-danger" onclick="clearLogs()">Clear Logs</button>
      </div>
      <div class="logs-container" id="logs">
        <div class="empty-state">No activity yet</div>
      </div>
    </div>
  </div>
  
  <script>
    const featureNames = {
      blockTrackers: 'Block Trackers',
      blockAds: 'Block Ads',
      blockMalware: 'Block Malware',
      blockPII: 'Block PII Leaks',
      stripReferrer: 'Strip Referrer',
      sanitizeCookies: 'Sanitize Cookies',
      upgradeHTTPS: 'Upgrade to HTTPS',
      blockMining: 'Block Cryptominers',
      mitmEnabled: 'YouTube Ad Blocking (Requires CA)'
    };
    
    const logIcons = {
      block: '🚫',
      pii: '🔐',
      upgrade: '🔒',
      info: 'ℹ️',
      error: '⚠️'
    };
    
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const stats = await res.json();
        
        document.getElementById('stat-total').textContent = stats.requestsTotal.toLocaleString();
        document.getElementById('stat-blocked').textContent = stats.requestsBlocked.toLocaleString();
        document.getElementById('stat-pii').textContent = stats.piiBlocked.toLocaleString();
        document.getElementById('stat-https').textContent = stats.httpsUpgraded.toLocaleString();
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    }
    
    async function fetchConfig() {
      try {
        const res = await fetch('/api/config');
        const features = await res.json();
        
        const container = document.getElementById('features');
        container.innerHTML = '';
        
        for (const [key, enabled] of Object.entries(features)) {
          const toggle = document.createElement('div');
          toggle.className = 'feature-toggle';
          toggle.innerHTML = \`
            <span class="feature-name">\${featureNames[key] || key}</span>
            <div class="toggle-switch \${enabled ? 'active' : ''}" data-feature="\${key}"></div>
          \`;
          toggle.onclick = () => toggleFeature(key, !enabled);
          container.appendChild(toggle);
        }
      } catch (err) {
        console.error('Failed to fetch config:', err);
      }
    }
    
    async function toggleFeature(feature, enabled) {
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [feature]: enabled })
        });
        fetchConfig();
      } catch (err) {
        console.error('Failed to toggle feature:', err);
      }
    }
    
    async function fetchLogs() {
      try {
        const res = await fetch('/api/logs?limit=50');
        const logs = await res.json();
        
        const container = document.getElementById('logs');
        
        if (logs.length === 0) {
          container.innerHTML = '<div class="empty-state">No activity yet</div>';
          return;
        }
        
        container.innerHTML = logs.reverse().map(log => \`
          <div class="log-entry">
            <div class="log-icon \${log.category}">\${logIcons[log.category] || '📋'}</div>
            <div class="log-content">
              <div class="log-action">\${log.action}</div>
              <div class="log-details">\${JSON.stringify(log.details)}</div>
            </div>
            <div class="log-time">\${new Date(log.timestamp).toLocaleTimeString()}</div>
          </div>
        \`).join('');
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    }
    
    async function clearLogs() {
      try {
        await fetch('/api/logs/clear', { method: 'POST' });
        fetchLogs();
      } catch (err) {
        console.error('Failed to clear logs:', err);
      }
    }
    
    // Initial load
    fetchStats();
    fetchConfig();
    fetchLogs();
    
    // Auto-refresh
    setInterval(fetchStats, 2000);
    setInterval(fetchLogs, 5000);
  </script>
</body>
</html>`;
  }
}
