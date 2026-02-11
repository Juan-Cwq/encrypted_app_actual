import { getProfile } from './profile-manager.js';
import { log } from '../shared/logger.js';

/**
 * PII Detection & Logging (Manifest V3 compatible)
 * 
 * Note: Manifest V3 does NOT support blocking webRequest listeners for regular extensions.
 * The `webRequestBlocking` permission is only available for enterprise-installed extensions.
 * 
 * This module now uses a non-blocking approach:
 * - Monitors requests and logs detected PII leaks
 * - Alerts the user via the popup/dashboard
 * - For actual blocking, use declarativeNetRequest rules (see rules/*.json)
 */

const PII_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/,
  email: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}\b/,
  phone: /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  creditCard: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/
};

// Store detected PII leaks for display in popup
const detectedLeaks = [];

export function initRequestInterceptor() {
  // Use non-blocking listener (no 'blocking' in extraInfoSpec)
  // This allows us to monitor and log, but not block requests
  chrome.webRequest.onBeforeRequest.addListener(
    handleRequest,
    { urls: ['<all_urls>'] },
    ['requestBody']
  );
  
  // Also monitor completed requests for additional context
  chrome.webRequest.onCompleted.addListener(
    handleCompletedRequest,
    { urls: ['<all_urls>'] }
  );
}

// Non-blocking request handler - logs PII but cannot block
async function handleRequest(details) {
  // Skip first-party main frame navigations
  if (details.type === 'main_frame') return;

  let origin;
  try {
    origin = details.initiator || new URL(details.url).origin;
  } catch {
    return;
  }

  const profile = await getProfile(origin);
  if (!profile.blockPII) return;

  // Check URL for PII
  const urlPII = scanForPII(details.url);
  if (urlPII) {
    const leak = {
      type: urlPII,
      location: 'url',
      url: details.url.substring(0, 200),
      hostname: new URL(details.url).hostname,
      timestamp: Date.now()
    };
    detectedLeaks.push(leak);
    
    await log('network', 'pii-in-url', {
      type: urlPII,
      url: details.url.substring(0, 200)
    }, details.tabId, new URL(details.url).hostname);
    
    // Notify user about the PII leak (they should avoid this site)
    notifyPIILeak(details.tabId, urlPII, 'URL');
  }

  // Check request body for PII
  if (details.requestBody) {
    let bodyText = '';

    if (details.requestBody.formData) {
      bodyText = Object.entries(details.requestBody.formData)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    } else if (details.requestBody.raw) {
      try {
        for (const part of details.requestBody.raw) {
          if (part.bytes) {
            bodyText += new TextDecoder().decode(part.bytes);
          }
        }
      } catch {}
    }

    if (bodyText) {
      const bodyPII = scanForPII(bodyText);
      if (bodyPII) {
        try {
          const requestOrigin = new URL(details.url).origin;
          // Log cross-origin PII leaks
          if (requestOrigin !== origin) {
            const leak = {
              type: bodyPII,
              location: 'body',
              destination: new URL(details.url).hostname,
              timestamp: Date.now()
            };
            detectedLeaks.push(leak);
            
            await log('network', 'pii-in-body', {
              type: bodyPII,
              destination: new URL(details.url).hostname
            }, details.tabId, new URL(details.url).hostname);
            
            notifyPIILeak(details.tabId, bodyPII, 'request body');
          }
        } catch {}
      }
    }
  }
}

function handleCompletedRequest(details) {
  // Could add additional logging for completed requests if needed
}

function scanForPII(text) {
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    if (pattern.test(text)) {
      return type;
    }
  }
  return null;
}

// Notify user about detected PII leak
async function notifyPIILeak(tabId, piiType, location) {
  try {
    // Update badge to show warning
    await chrome.action.setBadgeText({ text: '!', tabId });
    await chrome.action.setBadgeBackgroundColor({ color: '#E74C3C', tabId });
    
    // Store leak info for popup display
    const { piiLeaks = [] } = await chrome.storage.local.get('piiLeaks');
    piiLeaks.push({
      type: piiType,
      location,
      timestamp: Date.now()
    });
    // Keep only last 50 leaks
    await chrome.storage.local.set({ 
      piiLeaks: piiLeaks.slice(-50) 
    });
  } catch (e) {
    console.error('Failed to notify PII leak:', e);
  }
}

// Export for popup/dashboard to access
export function getDetectedLeaks() {
  return [...detectedLeaks];
}

export function clearDetectedLeaks() {
  detectedLeaks.length = 0;
}
