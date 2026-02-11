/**
 * Blocklist Manager
 * 
 * Manages domain blocklists for trackers, ads, malware, and mining domains.
 * Supports loading from local JSON files and downloading updates.
 * 
 * Enhanced with URL pattern matching for platforms like YouTube where
 * ads are served from the same domains as content.
 */

import fs from 'fs/promises';
import path from 'path';

export class BlocklistManager {
  constructor(rulesDir) {
    this.rulesDir = rulesDir;
    
    // Domain sets for fast lookups
    this.trackers = new Set();
    this.ads = new Set();
    this.malware = new Set();
    this.miners = new Set();
    this.httpsUpgrade = new Set();
    
    // Regex patterns for more complex matching
    this.trackerPatterns = [];
    this.adPatterns = [];
    
    // URL patterns for blocking specific paths (YouTube ads, etc.)
    this.adUrlPatterns = [];
    this.trackerUrlPatterns = [];
  }
  
  async load() {
    try {
      // Load tracker list
      await this.loadList('trackers.json', this.trackers);
      
      // Load ad list
      await this.loadList('ads.json', this.ads);
      
      // Load YouTube-specific ad domains
      await this.loadList('youtube-ads.json', this.ads);
      
      // Load malware/phishing list
      await this.loadList('malware.json', this.malware);
      
      // Load cryptominer list
      await this.loadList('miners.json', this.miners);
      
      // Load HTTPS upgrade list
      await this.loadList('https-upgrade.json', this.httpsUpgrade);
      
      // Load regex patterns
      await this.loadPatterns('tracker-patterns.json', this.trackerPatterns);
      await this.loadPatterns('ad-patterns.json', this.adPatterns);
      
      // Load URL patterns for YouTube and other embedded ads
      await this.loadUrlPatterns('youtube-ads.json', this.adUrlPatterns);
      
      // Add default URL patterns for common ad paths
      this.loadDefaultUrlPatterns();
      
    } catch (err) {
      console.error('Error loading blocklists:', err.message);
      // Continue with defaults
      this.loadDefaults();
    }
  }
  
  async loadUrlPatterns(filename, targetArray) {
    try {
      const filepath = path.join(this.rulesDir, filename);
      const data = await fs.readFile(filepath, 'utf8');
      const { urlPatterns } = JSON.parse(data);
      
      if (Array.isArray(urlPatterns)) {
        urlPatterns.forEach(p => {
          try {
            // Convert simple glob patterns to regex
            const regexStr = p
              .replace(/\./g, '\\.')
              .replace(/\*/g, '.*')
              .replace(/\?/g, '.');
            targetArray.push(new RegExp(regexStr, 'i'));
          } catch {}
        });
      }
    } catch (err) {
      // File doesn't exist or is invalid
    }
  }
  
  loadDefaultUrlPatterns() {
    // YouTube ad URL patterns
    const defaultAdUrlPatterns = [
      /\/pagead\//i,
      /\/ptracking/i,
      /\/api\/stats\/ads/i,
      /\/api\/stats\/watchtime/i,
      /\/get_midroll_info/i,
      /googleads\.g\.doubleclick\.net/i,
      /pubads\.g\.doubleclick\.net/i,
      /securepubads\.g\.doubleclick\.net/i,
      /pagead2\.googlesyndication\.com/i,
      /imasdk\.googleapis\.com/i,
      /\/(adsense|adwords|pagead)\//i,
      /ad_break/i,
      /adformat=/i,
      /ad_flags=/i,
      /ctier=L/i,  // YouTube ad tier indicator
      /\/pcs\/activeview/i,
      /\/simgad\//i,
      /\/generate_204.*ad/i,
      /\/log_event\?.*ad/i,
      /youtube\.com\/api\/stats\/ads/i,
      /youtube\.com\/pagead/i,
      /youtube\.com\/ptracking/i,
      /googlevideo\.com\/videoplayback.*oad=/i,
      /googlevideo\.com\/videoplayback.*ctier=L/i
    ];
    
    defaultAdUrlPatterns.forEach(p => {
      if (!this.adUrlPatterns.some(existing => existing.source === p.source)) {
        this.adUrlPatterns.push(p);
      }
    });
  }
  
  async loadList(filename, targetSet) {
    try {
      const filepath = path.join(this.rulesDir, filename);
      const data = await fs.readFile(filepath, 'utf8');
      const { domains } = JSON.parse(data);
      
      if (Array.isArray(domains)) {
        domains.forEach(d => targetSet.add(d.toLowerCase()));
      }
    } catch (err) {
      // File doesn't exist or is invalid, use defaults
    }
  }
  
  async loadPatterns(filename, targetArray) {
    try {
      const filepath = path.join(this.rulesDir, filename);
      const data = await fs.readFile(filepath, 'utf8');
      const { patterns } = JSON.parse(data);
      
      if (Array.isArray(patterns)) {
        patterns.forEach(p => {
          try {
            targetArray.push(new RegExp(p, 'i'));
          } catch {}
        });
      }
    } catch (err) {
      // File doesn't exist or is invalid
    }
  }
  
  loadDefaults() {
    // Common trackers
    const defaultTrackers = [
      'google-analytics.com', 'googletagmanager.com', 'doubleclick.net',
      'facebook.com/tr', 'connect.facebook.net', 'pixel.facebook.com',
      'analytics.twitter.com', 'ads.twitter.com',
      'bat.bing.com', 'clarity.ms',
      'hotjar.com', 'mouseflow.com', 'fullstory.com',
      'segment.io', 'segment.com', 'mixpanel.com', 'amplitude.com',
      'heapanalytics.com', 'kissmetrics.com',
      'newrelic.com', 'nr-data.net',
      'sentry.io', 'bugsnag.com',
      'intercom.io', 'drift.com',
      'hubspot.com', 'hs-scripts.com', 'hs-analytics.net',
      'marketo.net', 'munchkin.marketo.net',
      'pardot.com', 'salesforce.com/pixel',
      'quantserve.com', 'scorecardresearch.com',
      'taboola.com', 'outbrain.com',
      'criteo.com', 'criteo.net'
    ];
    
    defaultTrackers.forEach(d => this.trackers.add(d));
    
    // Common ad domains
    const defaultAds = [
      'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
      'moatads.com', 'adsrvr.org', 'adnxs.com',
      'rubiconproject.com', 'pubmatic.com', 'openx.net',
      'amazon-adsystem.com', 'media.net',
      'advertising.com', 'adform.net', 'smartadserver.com'
    ];
    
    defaultAds.forEach(d => this.ads.add(d));
    
    // Crypto miners
    const defaultMiners = [
      'coinhive.com', 'coin-hive.com', 'coinhive.min.js',
      'minero.cc', 'crypto-loot.com', 'cryptoloot.pro',
      'webmine.cz', 'webminepool.com',
      'coinerra.com', 'papoto.com', 'rocks.io'
    ];
    
    defaultMiners.forEach(d => this.miners.add(d));
    
    // Default tracker patterns
    this.trackerPatterns = [
      /track(er|ing)?[\.\-_]/i,
      /analytics[\.\-_]/i,
      /pixel[\.\-_]/i,
      /beacon[\.\-_]/i,
      /telemetry[\.\-_]/i,
      /metrics[\.\-_]/i
    ];
    
    // Default ad patterns
    this.adPatterns = [
      /^ads?\./i,
      /[\.\-_]ads?[\.\-_]/i,
      /adserv/i,
      /banner[\.\-_]/i,
      /sponsor/i
    ];
  }
  
  isTracker(hostname) {
    hostname = hostname.toLowerCase();
    
    // Direct match
    if (this.trackers.has(hostname)) return true;
    
    // Check parent domains
    const parts = hostname.split('.');
    for (let i = 1; i < parts.length - 1; i++) {
      const parent = parts.slice(i).join('.');
      if (this.trackers.has(parent)) return true;
    }
    
    // Pattern match
    return this.trackerPatterns.some(p => p.test(hostname));
  }
  
  isAd(hostname) {
    hostname = hostname.toLowerCase();
    
    if (this.ads.has(hostname)) return true;
    
    const parts = hostname.split('.');
    for (let i = 1; i < parts.length - 1; i++) {
      const parent = parts.slice(i).join('.');
      if (this.ads.has(parent)) return true;
    }
    
    return this.adPatterns.some(p => p.test(hostname));
  }
  
  /**
   * Check if a full URL matches ad patterns
   * This is essential for YouTube and similar platforms where ads
   * come from the same domains as content
   */
  isAdUrl(url) {
    if (!url) return false;
    
    // Check URL patterns (for YouTube, etc.)
    return this.adUrlPatterns.some(p => p.test(url));
  }
  
  /**
   * Check if a full URL matches tracker patterns
   */
  isTrackerUrl(url) {
    if (!url) return false;
    
    return this.trackerUrlPatterns.some(p => p.test(url));
  }
  
  /**
   * Combined check for hostname + URL
   */
  shouldBlock(hostname, url = '') {
    // Check hostname-based blocking first
    if (this.isTracker(hostname)) {
      return { blocked: true, reason: 'Tracker', category: 'tracker' };
    }
    
    if (this.isAd(hostname)) {
      return { blocked: true, reason: 'Advertisement', category: 'ad' };
    }
    
    if (this.isMalware(hostname)) {
      return { blocked: true, reason: 'Malware/Phishing', category: 'malware' };
    }
    
    if (this.isMiner(hostname)) {
      return { blocked: true, reason: 'Cryptominer', category: 'miner' };
    }
    
    // Check URL-based blocking (for embedded ads like YouTube)
    if (url) {
      if (this.isAdUrl(url)) {
        return { blocked: true, reason: 'Ad URL Pattern', category: 'ad' };
      }
      
      if (this.isTrackerUrl(url)) {
        return { blocked: true, reason: 'Tracker URL Pattern', category: 'tracker' };
      }
    }
    
    return { blocked: false };
  }
  
  isMalware(hostname) {
    hostname = hostname.toLowerCase();
    
    if (this.malware.has(hostname)) return true;
    
    const parts = hostname.split('.');
    for (let i = 1; i < parts.length - 1; i++) {
      const parent = parts.slice(i).join('.');
      if (this.malware.has(parent)) return true;
    }
    
    return false;
  }
  
  isMiner(hostname) {
    hostname = hostname.toLowerCase();
    
    if (this.miners.has(hostname)) return true;
    
    const parts = hostname.split('.');
    for (let i = 1; i < parts.length - 1; i++) {
      const parent = parts.slice(i).join('.');
      if (this.miners.has(parent)) return true;
    }
    
    return false;
  }
  
  shouldUpgradeHTTPS(hostname) {
    // For now, try to upgrade all sites (most support HTTPS now)
    // In production, you'd use a list like HTTPS Everywhere rules
    return true;
  }
  
  getStats() {
    return {
      totalDomains: this.trackers.size + this.ads.size + this.malware.size + this.miners.size,
      trackers: this.trackers.size,
      ads: this.ads.size,
      malware: this.malware.size,
      miners: this.miners.size,
      patterns: this.trackerPatterns.length + this.adPatterns.length,
      urlPatterns: this.adUrlPatterns.length + this.trackerUrlPatterns.length
    };
  }
  
  // Add domain to blocklist
  addDomain(category, domain) {
    domain = domain.toLowerCase();
    
    switch (category) {
      case 'tracker': this.trackers.add(domain); break;
      case 'ad': this.ads.add(domain); break;
      case 'malware': this.malware.add(domain); break;
      case 'miner': this.miners.add(domain); break;
    }
  }
  
  // Remove domain from blocklist
  removeDomain(category, domain) {
    domain = domain.toLowerCase();
    
    switch (category) {
      case 'tracker': this.trackers.delete(domain); break;
      case 'ad': this.ads.delete(domain); break;
      case 'malware': this.malware.delete(domain); break;
      case 'miner': this.miners.delete(domain); break;
    }
  }
  
  // Check if domain is whitelisted
  isWhitelisted(hostname) {
    // Implement whitelist functionality if needed
    return false;
  }
}
