/**
 * PII Detector
 * 
 * Detects personally identifiable information in requests.
 * Scans URLs, headers, and request bodies for sensitive data patterns.
 */

export class PIIDetector {
  constructor() {
    // PII patterns with descriptions
    this.patterns = {
      ssn: {
        pattern: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/,
        description: 'Social Security Number',
        severity: 'critical'
      },
      
      creditCard: {
        pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/,
        description: 'Credit Card Number',
        severity: 'critical'
      },
      
      email: {
        pattern: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}\b/,
        description: 'Email Address',
        severity: 'high'
      },
      
      phone: {
        pattern: /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
        description: 'Phone Number',
        severity: 'high'
      },
      
      ipAddress: {
        pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
        description: 'IP Address',
        severity: 'medium'
      },
      
      dateOfBirth: {
        pattern: /\b(?:0?[1-9]|1[0-2])[-\/](?:0?[1-9]|[12]\d|3[01])[-\/](?:19|20)\d{2}\b/,
        description: 'Date of Birth',
        severity: 'medium'
      },
      
      passport: {
        pattern: /\b[A-Z]{1,2}[0-9]{6,9}\b/,
        description: 'Passport Number',
        severity: 'high'
      },
      
      driversLicense: {
        pattern: /\b[A-Z][0-9]{7,8}\b/,
        description: "Driver's License",
        severity: 'high'
      },
      
      bankAccount: {
        pattern: /\b[0-9]{8,17}\b/,
        description: 'Bank Account Number',
        severity: 'high',
        // Only match if preceded by account-related keywords
        contextRequired: /(?:account|acct|routing|aba|iban)[\s:=]+/i
      },
      
      medicalRecord: {
        pattern: /\b(?:MRN|medical[_\s]?record)[:\s]*[A-Z0-9]{6,12}\b/i,
        description: 'Medical Record Number',
        severity: 'critical'
      }
    };
    
    // Common tracking parameters in URLs
    this.trackingParams = new Set([
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'dclid',
      'mc_eid', 'mc_cid',
      '_ga', '_gl', '_gid',
      'yclid', 'ymclid',
      'ref', 'ref_src', 'referer',
      'affiliate', 'aff_id',
      'clickid', 'click_id',
      'source', 'campaign'
    ]);
    
    // Whitelist for known safe contexts
    this.safeContexts = [
      /example\.com/i,
      /test/i,
      /demo/i,
      /placeholder/i
    ];
  }
  
  /**
   * Scan text for PII
   * @param {string} text - Text to scan (URL, body, etc.)
   * @param {Object} options - Scan options
   * @returns {Object} - { found: boolean, type: string, severity: string, matches: array }
   */
  scan(text, options = {}) {
    if (!text || typeof text !== 'string') {
      return { found: false };
    }
    
    // Skip if it's a safe context (test data, examples)
    if (this.safeContexts.some(pattern => pattern.test(text))) {
      return { found: false };
    }
    
    const results = [];
    
    for (const [type, config] of Object.entries(this.patterns)) {
      // Skip certain types if options specify
      if (options.skipTypes && options.skipTypes.includes(type)) {
        continue;
      }
      
      // Check for context requirement
      if (config.contextRequired && !config.contextRequired.test(text)) {
        continue;
      }
      
      const matches = text.match(config.pattern);
      if (matches) {
        // Validate the match
        if (this.validateMatch(type, matches[0])) {
          results.push({
            type: config.description,
            severity: config.severity,
            match: this.redact(matches[0])
          });
        }
      }
    }
    
    if (results.length > 0) {
      // Return the most severe match
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      results.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
      
      return {
        found: true,
        type: results[0].type,
        severity: results[0].severity,
        allMatches: results
      };
    }
    
    return { found: false };
  }
  
  /**
   * Validate a potential PII match to reduce false positives
   */
  validateMatch(type, value) {
    switch (type) {
      case 'creditCard':
        return this.luhnCheck(value.replace(/\D/g, ''));
      
      case 'ssn':
        // SSN shouldn't start with 000, 666, or 900-999
        const ssnDigits = value.replace(/\D/g, '');
        const area = parseInt(ssnDigits.substring(0, 3));
        if (area === 0 || area === 666 || area >= 900) return false;
        return true;
      
      case 'email':
        // Basic email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      
      case 'phone':
        // Remove non-digits and check length
        const phoneDigits = value.replace(/\D/g, '');
        return phoneDigits.length >= 10 && phoneDigits.length <= 11;
      
      case 'bankAccount':
        // Bank accounts should be 8-17 digits
        const digits = value.replace(/\D/g, '');
        return digits.length >= 8 && digits.length <= 17;
      
      default:
        return true;
    }
  }
  
  /**
   * Luhn algorithm check for credit card numbers
   */
  luhnCheck(cardNumber) {
    if (!/^\d+$/.test(cardNumber)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
  
  /**
   * Redact sensitive data for logging
   */
  redact(value) {
    if (!value) return '';
    
    if (value.length <= 4) {
      return '****';
    }
    
    // Show first 2 and last 2 characters
    return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
  }
  
  /**
   * Extract and flag tracking parameters from URL
   */
  extractTrackingParams(url) {
    try {
      const urlObj = new URL(url);
      const trackingFound = [];
      
      for (const [key, value] of urlObj.searchParams) {
        if (this.trackingParams.has(key.toLowerCase())) {
          trackingFound.push({ param: key, value });
        }
      }
      
      return trackingFound;
    } catch {
      return [];
    }
  }
  
  /**
   * Clean tracking parameters from URL
   */
  cleanURL(url) {
    try {
      const urlObj = new URL(url);
      
      for (const param of this.trackingParams) {
        urlObj.searchParams.delete(param);
      }
      
      return urlObj.toString();
    } catch {
      return url;
    }
  }
  
  /**
   * Scan for fingerprinting attempts
   */
  detectFingerprinting(headers) {
    const fingerprintingIndicators = [];
    
    // Check for canvas fingerprinting in requests
    const suspiciousHeaders = [
      'x-canvas-fingerprint',
      'x-webgl-fingerprint',
      'x-audio-fingerprint',
      'x-font-fingerprint'
    ];
    
    for (const header of suspiciousHeaders) {
      if (headers[header]) {
        fingerprintingIndicators.push(header);
      }
    }
    
    return fingerprintingIndicators;
  }
}
