/**
 * Header Sanitizer
 * 
 * Sanitizes HTTP headers to protect privacy:
 * - Strips referrer headers
 * - Removes tracking headers
 * - Sanitizes cookies
 * - Blocks fingerprinting headers
 */

export class HeaderSanitizer {
  constructor(config) {
    this.config = config;
    
    // Headers that should be removed entirely
    this.removeHeaders = new Set([
      'x-client-data',           // Chrome's tracking header
      'x-forwarded-for',         // IP leakage
      'x-real-ip',               // IP leakage
      'via',                     // Proxy chain info
      'forwarded',               // Proxy info
      'x-requested-with',        // AJAX indicator
      'dnt',                     // DNT doesn't work, remove to reduce fingerprint
      'sec-gpc'                  // Global Privacy Control (optional)
    ]);
    
    // Headers that reveal too much info
    this.fingerprintHeaders = new Set([
      'accept-language',         // Language fingerprinting
      'sec-ch-ua',               // User agent hints
      'sec-ch-ua-mobile',
      'sec-ch-ua-platform',
      'sec-ch-ua-platform-version',
      'sec-ch-ua-full-version',
      'sec-ch-ua-arch',
      'sec-ch-ua-bitness',
      'sec-ch-ua-model'
    ]);
    
    // Standardized values to reduce fingerprinting
    this.standardizedHeaders = {
      'accept-language': 'en-US,en;q=0.9',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    };
  }
  
  /**
   * Sanitize request headers
   */
  sanitize(headers, targetHost, stats) {
    const sanitized = { ...headers };
    
    // Remove tracking/fingerprinting headers
    for (const header of this.removeHeaders) {
      delete sanitized[header];
    }
    
    // Handle referrer stripping
    if (this.config.features.stripReferrer) {
      const referer = sanitized['referer'] || sanitized['referrer'];
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          const targetUrl = new URL(`https://${targetHost}`);
          
          // If cross-origin, strip or reduce referrer
          if (refererUrl.origin !== targetUrl.origin) {
            if (this.config.referrerPolicy === 'strict') {
              // Remove entirely
              delete sanitized['referer'];
              delete sanitized['referrer'];
            } else {
              // Reduce to origin only
              sanitized['referer'] = refererUrl.origin + '/';
            }
            
            if (stats) stats.referrersStripped++;
          }
        } catch {
          // Invalid URL, remove it
          delete sanitized['referer'];
          delete sanitized['referrer'];
        }
      }
    }
    
    // Standardize fingerprinting headers
    for (const [header, value] of Object.entries(this.standardizedHeaders)) {
      if (sanitized[header]) {
        sanitized[header] = value;
      }
    }
    
    // Remove User-Agent client hints
    for (const header of this.fingerprintHeaders) {
      delete sanitized[header];
    }
    
    return sanitized;
  }
  
  /**
   * Sanitize cookies in response
   */
  sanitizeCookies(cookies, hostname) {
    if (!Array.isArray(cookies)) {
      cookies = [cookies];
    }
    
    return cookies.map(cookie => {
      // Parse cookie
      const parts = cookie.split(';').map(p => p.trim());
      const [nameValue, ...attributes] = parts;
      
      // Rebuild with enhanced security
      const newAttributes = [];
      let hasSecure = false;
      let hasSameSite = false;
      let hasHttpOnly = false;
      
      for (const attr of attributes) {
        const lowerAttr = attr.toLowerCase();
        
        // Track existing attributes
        if (lowerAttr === 'secure') hasSecure = true;
        if (lowerAttr.startsWith('samesite')) hasSameSite = true;
        if (lowerAttr === 'httponly') hasHttpOnly = true;
        
        // Keep most attributes
        newAttributes.push(attr);
      }
      
      // Add security attributes if missing
      if (!hasSecure) newAttributes.push('Secure');
      if (!hasSameSite) newAttributes.push('SameSite=Strict');
      if (!hasHttpOnly) newAttributes.push('HttpOnly');
      
      return [nameValue, ...newAttributes].join('; ');
    }).filter(c => {
      // Filter out known tracking cookies
      const cookieName = c.split('=')[0].toLowerCase();
      return !this.isTrackingCookie(cookieName);
    });
  }
  
  /**
   * Check if cookie is a known tracking cookie
   */
  isTrackingCookie(name) {
    const trackingCookies = [
      '_ga', '_gid', '_gat',           // Google Analytics
      '_fbp', '_fbc',                   // Facebook
      'fr',                             // Facebook
      '_pin_unauth',                    // Pinterest
      '__utma', '__utmb', '__utmc', '__utmz', '__utmv', // Legacy GA
      'IDE', 'DSID', 'NID',             // Google Ads
      'personalization_id',             // Twitter
      'guest_id',                       // Twitter
      '_pinterest_sess',                // Pinterest
      '_sp_id', '_sp_ses',              // Snowplow
      'mp_',                            // Mixpanel prefix
      'amplitude_id',                   // Amplitude
      'ajs_anonymous_id',               // Segment
      'hubspotutk',                     // HubSpot
      '__hstc', '__hssc', '__hssrc',    // HubSpot
      '_mkto_trk',                      // Marketo
      'pardot'                          // Pardot
    ];
    
    return trackingCookies.some(tc => 
      name === tc || name.startsWith(tc)
    );
  }
  
  /**
   * Add privacy-enhancing headers to response
   */
  enhanceResponseHeaders(headers) {
    return {
      ...headers,
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'SAMEORIGIN',
      'x-xss-protection': '1; mode=block',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
    };
  }
}
