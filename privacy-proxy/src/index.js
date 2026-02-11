/**
 * Haven Privacy Proxy
 * 
 * A local HTTP/HTTPS proxy with full privacy protection capabilities:
 * - Tracker and ad domain blocking
 * - PII leak detection and blocking
 * - Referrer header stripping
 * - Cookie sanitization
 * - HTTPS upgrade enforcement
 * - Malicious domain blocking
 * 
 * Unlike browser extensions (limited by Manifest V3), this runs locally
 * with full network interception capabilities.
 */

import http from 'http';
import https from 'https';
import net from 'net';
import tls from 'tls';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { BlocklistManager } from './blocklist.js';
import { PIIDetector } from './pii-detector.js';
import { HeaderSanitizer } from './header-sanitizer.js';
import { Logger } from './logger.js';
import { Dashboard } from './dashboard.js';
import { CertManager } from './cert-manager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===== Configuration =====

const CONFIG = {
  proxyPort: 8888,
  dashboardPort: 8889,
  
  // Feature toggles (can be changed via dashboard)
  features: {
    blockTrackers: true,
    blockAds: true,
    blockMalware: true,
    blockPII: true,
    stripReferrer: true,
    sanitizeCookies: true,
    upgradeHTTPS: true,
    blockMining: true,
    mitmEnabled: true  // Enable MITM for YouTube ad blocking (requires CA cert install)
  },
  
  // Logging
  verbose: false,
  logFile: path.join(__dirname, '../logs/proxy.log')
};

// ===== Initialize Components =====

const logger = new Logger(CONFIG);
const blocklist = new BlocklistManager(path.join(__dirname, '../rules'));
const piiDetector = new PIIDetector();
const headerSanitizer = new HeaderSanitizer(CONFIG);
const certManager = new CertManager(path.join(__dirname, '../certs'));
const dashboard = new Dashboard(CONFIG, blocklist, logger);

// Stats tracking
const stats = {
  requestsTotal: 0,
  requestsBlocked: 0,
  trackersBlocked: 0,
  adsBlocked: 0,
  piiBlocked: 0,
  httpsUpgraded: 0,
  referrersStripped: 0,
  cookiesSanitized: 0,
  startTime: Date.now()
};

// ===== HTTP Proxy Server =====

const proxyServer = http.createServer(async (clientReq, clientRes) => {
  stats.requestsTotal++;
  
  try {
    const url = new URL(clientReq.url);
    const hostname = url.hostname;
    
    // Check blocklists
    const blockResult = await checkBlocking(hostname, url.href);
    if (blockResult.blocked) {
      stats.requestsBlocked++;
      stats[blockResult.statKey]++;
      
      logger.log('block', blockResult.reason, { url: url.href, hostname });
      
      clientRes.writeHead(403, { 'Content-Type': 'text/plain' });
      clientRes.end(`Blocked by Haven Privacy Proxy: ${blockResult.reason}`);
      return;
    }
    
    // Check for PII in URL
    if (CONFIG.features.blockPII) {
      const piiResult = piiDetector.scan(url.href);
      if (piiResult.found) {
        stats.requestsBlocked++;
        stats.piiBlocked++;
        
        logger.log('pii', `PII detected in URL: ${piiResult.type}`, { url: url.href });
        
        clientRes.writeHead(403, { 'Content-Type': 'text/plain' });
        clientRes.end(`Blocked: Potential ${piiResult.type} detected in request`);
        return;
      }
    }
    
    // HTTPS upgrade
    if (CONFIG.features.upgradeHTTPS && url.protocol === 'http:') {
      const shouldUpgrade = await blocklist.shouldUpgradeHTTPS(hostname);
      if (shouldUpgrade) {
        stats.httpsUpgraded++;
        logger.log('upgrade', 'HTTPS upgrade', { hostname });
        
        clientRes.writeHead(301, { 'Location': url.href.replace('http:', 'https:') });
        clientRes.end();
        return;
      }
    }
    
    // Sanitize headers
    const sanitizedHeaders = headerSanitizer.sanitize(clientReq.headers, hostname, stats);
    
    // Forward request
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: clientReq.method,
      headers: sanitizedHeaders
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      // Sanitize response cookies if enabled
      if (CONFIG.features.sanitizeCookies && proxyRes.headers['set-cookie']) {
        proxyRes.headers['set-cookie'] = headerSanitizer.sanitizeCookies(
          proxyRes.headers['set-cookie'],
          hostname
        );
      }
      
      clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(clientRes);
    });
    
    proxyReq.on('error', (err) => {
      logger.log('error', 'Proxy request failed', { error: err.message, url: url.href });
      clientRes.writeHead(502);
      clientRes.end('Proxy Error');
    });
    
    // Check request body for PII
    if (CONFIG.features.blockPII && ['POST', 'PUT', 'PATCH'].includes(clientReq.method)) {
      let body = '';
      clientReq.on('data', chunk => {
        body += chunk.toString();
        // Limit body scanning to first 10KB
        if (body.length > 10240) {
          clientReq.removeAllListeners('data');
          proxyReq.write(body);
          clientReq.pipe(proxyReq);
        }
      });
      
      clientReq.on('end', () => {
        const piiResult = piiDetector.scan(body);
        if (piiResult.found) {
          stats.requestsBlocked++;
          stats.piiBlocked++;
          
          logger.log('pii', `PII detected in body: ${piiResult.type}`, { 
            hostname,
            method: clientReq.method 
          });
          
          clientRes.writeHead(403, { 'Content-Type': 'text/plain' });
          clientRes.end(`Blocked: Potential ${piiResult.type} detected in request body`);
          proxyReq.destroy();
          return;
        }
        
        proxyReq.write(body);
        proxyReq.end();
      });
    } else {
      clientReq.pipe(proxyReq);
    }
    
  } catch (err) {
    logger.log('error', 'Request handling failed', { error: err.message });
    clientRes.writeHead(500);
    clientRes.end('Internal Proxy Error');
  }
});

// ===== HTTPS CONNECT Tunnel =====

proxyServer.on('connect', async (req, clientSocket, head) => {
  stats.requestsTotal++;
  
  const [hostname, port] = req.url.split(':');
  const targetPort = parseInt(port) || 443;
  
  // Check blocklists for CONNECT requests
  const blockResult = await checkBlocking(hostname);
  if (blockResult.blocked) {
    stats.requestsBlocked++;
    stats[blockResult.statKey]++;
    
    logger.log('block', blockResult.reason, { hostname, method: 'CONNECT' });
    
    clientSocket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    clientSocket.destroy();
    return;
  }
  
  // Create tunnel to target
  const serverSocket = net.connect(targetPort, hostname, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });
  
  serverSocket.on('error', (err) => {
    logger.log('error', 'CONNECT tunnel failed', { hostname, error: err.message });
    clientSocket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
    clientSocket.destroy();
  });
  
  clientSocket.on('error', () => serverSocket.destroy());
});

// ===== Helper Functions =====

async function checkBlocking(hostname, url = '') {
  // First check hostname-based blocking
  if (CONFIG.features.blockTrackers && blocklist.isTracker(hostname)) {
    return { blocked: true, reason: 'Tracker', statKey: 'trackersBlocked' };
  }
  
  if (CONFIG.features.blockAds && blocklist.isAd(hostname)) {
    return { blocked: true, reason: 'Advertisement', statKey: 'adsBlocked' };
  }
  
  if (CONFIG.features.blockMalware && blocklist.isMalware(hostname)) {
    return { blocked: true, reason: 'Malware/Phishing', statKey: 'requestsBlocked' };
  }
  
  if (CONFIG.features.blockMining && blocklist.isMiner(hostname)) {
    return { blocked: true, reason: 'Cryptominer', statKey: 'requestsBlocked' };
  }
  
  // Check URL-based blocking (for YouTube ads and similar)
  if (url && CONFIG.features.blockAds && blocklist.isAdUrl(url)) {
    return { blocked: true, reason: 'Ad URL Pattern', statKey: 'adsBlocked' };
  }
  
  if (url && CONFIG.features.blockTrackers && blocklist.isTrackerUrl(url)) {
    return { blocked: true, reason: 'Tracker URL Pattern', statKey: 'trackersBlocked' };
  }
  
  return { blocked: false };
}

// ===== Start Servers =====

async function start() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║   ██╗  ██╗ █████╗ ██╗   ██╗███████╗███╗   ██╗           ║');
  console.log('║   ██║  ██║██╔══██╗██║   ██║██╔════╝████╗  ██║           ║');
  console.log('║   ███████║███████║██║   ██║█████╗  ██╔██╗ ██║           ║');
  console.log('║   ██╔══██║██╔══██║╚██╗ ██╔╝██╔══╝  ██║╚██╗██║           ║');
  console.log('║   ██║  ██║██║  ██║ ╚████╔╝ ███████╗██║ ╚████║           ║');
  console.log('║   ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝           ║');
  console.log('║                                                          ║');
  console.log('║              P R I V A C Y   P R O X Y                   ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  // Load blocklists
  console.log('📋 Loading blocklists...');
  await blocklist.load();
  console.log(`   ✓ ${blocklist.getStats().totalDomains.toLocaleString()} domains loaded\n`);
  
  // Start proxy server
  proxyServer.listen(CONFIG.proxyPort, () => {
    console.log(`🛡️  Proxy server running on port ${CONFIG.proxyPort}`);
    console.log(`   Configure your browser/system to use: 127.0.0.1:${CONFIG.proxyPort}\n`);
  });
  
  // Start dashboard
  dashboard.start(CONFIG.dashboardPort, stats);
  console.log(`📊 Dashboard available at: http://localhost:${CONFIG.dashboardPort}\n`);
  
  console.log('🔒 Privacy features enabled:');
  Object.entries(CONFIG.features).forEach(([feature, enabled]) => {
    const icon = enabled ? '✓' : '✗';
    const color = enabled ? '\x1b[32m' : '\x1b[31m';
    console.log(`   ${color}${icon}\x1b[0m ${formatFeatureName(feature)}`);
  });
  console.log('');
  
  console.log('ℹ️  Press Ctrl+C to stop the proxy\n');
}

function formatFeatureName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace('P I I', 'PII')
    .replace('H T T P S', 'HTTPS');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n📊 Session Statistics:');
  console.log(`   Total requests:     ${stats.requestsTotal.toLocaleString()}`);
  console.log(`   Requests blocked:   ${stats.requestsBlocked.toLocaleString()}`);
  console.log(`   Trackers blocked:   ${stats.trackersBlocked.toLocaleString()}`);
  console.log(`   Ads blocked:        ${stats.adsBlocked.toLocaleString()}`);
  console.log(`   PII leaks blocked:  ${stats.piiBlocked.toLocaleString()}`);
  console.log(`   HTTPS upgraded:     ${stats.httpsUpgraded.toLocaleString()}`);
  console.log(`   Referrers stripped: ${stats.referrersStripped.toLocaleString()}`);
  
  const uptime = Math.round((Date.now() - stats.startTime) / 1000);
  console.log(`   Session duration:   ${Math.floor(uptime / 60)}m ${uptime % 60}s\n`);
  
  process.exit(0);
});

start().catch(console.error);
