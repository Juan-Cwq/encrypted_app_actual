/**
 * Logger
 * 
 * Handles logging of privacy events, blocks, and errors.
 * Supports file logging and real-time dashboard updates.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class Logger {
  constructor(config) {
    this.config = config;
    this.logs = [];
    this.maxLogs = 1000;
    this.listeners = [];
    
    // Ensure logs directory exists
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    this.logFile = path.join(logsDir, 'proxy.log');
    this.logStream = null;
    
    if (config.logFile) {
      try {
        this.logStream = fs.createWriteStream(this.logFile, { flags: 'a' });
      } catch (err) {
        console.error('Failed to open log file:', err.message);
      }
    }
  }
  
  /**
   * Log an event
   */
  log(category, action, details = {}, notify = true) {
    const entry = {
      timestamp: new Date().toISOString(),
      category,
      action,
      details: typeof details === 'object' ? details : { message: details }
    };
    
    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Write to file
    if (this.logStream) {
      const line = JSON.stringify(entry) + '\n';
      this.logStream.write(line);
    }
    
    // Console output if verbose
    if (this.config.verbose) {
      this.printLog(entry);
    }
    
    // Notify listeners (for dashboard)
    if (notify) {
      this.notifyListeners(entry);
    }
  }
  
  /**
   * Print formatted log to console
   */
  printLog(entry) {
    const colors = {
      block: '\x1b[31m',    // Red
      pii: '\x1b[35m',      // Magenta
      upgrade: '\x1b[32m',  // Green
      error: '\x1b[33m',    // Yellow
      info: '\x1b[36m',     // Cyan
      reset: '\x1b[0m'
    };
    
    const color = colors[entry.category] || colors.info;
    const time = entry.timestamp.split('T')[1].split('.')[0];
    
    let message = `${color}[${time}] [${entry.category.toUpperCase()}] ${entry.action}`;
    
    if (entry.details.url) {
      message += ` - ${entry.details.url.substring(0, 60)}`;
    } else if (entry.details.hostname) {
      message += ` - ${entry.details.hostname}`;
    }
    
    message += colors.reset;
    
    console.log(message);
  }
  
  /**
   * Get recent logs
   */
  getLogs(filter = {}) {
    let result = [...this.logs];
    
    if (filter.category) {
      result = result.filter(l => l.category === filter.category);
    }
    
    if (filter.since) {
      const since = new Date(filter.since);
      result = result.filter(l => new Date(l.timestamp) >= since);
    }
    
    if (filter.limit) {
      result = result.slice(-filter.limit);
    }
    
    return result;
  }
  
  /**
   * Clear logs
   */
  clear() {
    this.logs = [];
    
    // Truncate log file
    if (this.logStream) {
      this.logStream.end();
      this.logStream = fs.createWriteStream(this.logFile, { flags: 'w' });
    }
  }
  
  /**
   * Add listener for real-time updates
   */
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  /**
   * Remove listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }
  
  /**
   * Notify all listeners
   */
  notifyListeners(entry) {
    this.listeners.forEach(callback => {
      try {
        callback(entry);
      } catch {}
    });
  }
  
  /**
   * Get log statistics
   */
  getStats() {
    const stats = {
      total: this.logs.length,
      byCategory: {}
    };
    
    for (const log of this.logs) {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    }
    
    return stats;
  }
  
  /**
   * Export logs as JSON
   */
  export() {
    return JSON.stringify(this.logs, null, 2);
  }
  
  /**
   * Close log file
   */
  close() {
    if (this.logStream) {
      this.logStream.end();
    }
  }
}
