import { log } from '../shared/logger.js';

/**
 * Referrer Stripper (Manifest V3 compatible)
 * 
 * Note: Manifest V3 doesn't support blocking webRequest for header modification.
 * Instead, we use declarativeNetRequest to modify/remove referrer headers.
 * 
 * This module sets up dynamic rules to strip referrers from cross-origin requests.
 */

// Dynamic rule IDs for referrer stripping
const REFERRER_STRIP_RULE_BASE = 60000;

export async function initReferrerStripper() {
  // Set up referrer stripping rules
  await setupReferrerRules();
  
  // Set up non-blocking listener for logging only
  chrome.webRequest.onBeforeSendHeaders.addListener(
    handleReferrer,
    { urls: ['<all_urls>'] },
    ['requestHeaders'] // No 'blocking' - just monitoring
  );
}

// Non-blocking referrer monitor (for logging only)
async function handleReferrer(details) {
  if (details.type === 'main_frame') return;

  let origin;
  try {
    origin = new URL(details.initiator || details.url).origin;
  } catch {
    return;
  }

  const requestUrl = new URL(details.url);
  const isCrossOrigin = origin !== requestUrl.origin;

  if (!isCrossOrigin) return;

  // Check if referrer header exists (before our rules strip it)
  const hasReferrer = details.requestHeaders?.some(h => 
    h.name.toLowerCase() === 'referer'
  );

  if (hasReferrer) {
    log('tracking', 'referrer-stripping-active', {
      from: origin,
      to: requestUrl.hostname
    }, details.tabId, requestUrl.hostname);
  }
}

// Set up declarativeNetRequest rules for referrer stripping
async function setupReferrerRules() {
  try {
    const { stripReferrer = true, referrerLevel = 'moderate' } = 
      await chrome.storage.local.get(['stripReferrer', 'referrerLevel']);
    
    if (stripReferrer) {
      const rules = [];
      
      if (referrerLevel === 'strict') {
        // Strict mode: Remove referrer entirely for cross-origin requests
        rules.push({
          id: REFERRER_STRIP_RULE_BASE,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [{
              header: 'Referer',
              operation: 'remove'
            }]
          },
          condition: {
            domainType: 'thirdParty',
            resourceTypes: [
              'script', 'stylesheet', 'image', 'font', 'object', 
              'xmlhttprequest', 'ping', 'media', 'websocket', 'other'
            ]
          }
        });
      } else {
        // Moderate mode: Strip path, keep origin only
        // Note: declarativeNetRequest can't set dynamic values,
        // so we use 'remove' and rely on browser's default referrer policy
        rules.push({
          id: REFERRER_STRIP_RULE_BASE,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [{
              header: 'Referer',
              operation: 'remove'
            }]
          },
          condition: {
            domainType: 'thirdParty',
            resourceTypes: [
              'script', 'stylesheet', 'image', 'font', 'object', 
              'xmlhttprequest', 'ping', 'media', 'websocket', 'other'
            ]
          }
        });
      }

      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [REFERRER_STRIP_RULE_BASE],
        addRules: rules
      });
    } else {
      // Remove referrer stripping rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [REFERRER_STRIP_RULE_BASE]
      });
    }
  } catch (e) {
    console.error('Failed to setup referrer rules:', e);
  }
}

// Export for settings changes
export async function updateReferrerStripping(enabled, level = 'moderate') {
  await chrome.storage.local.set({ 
    stripReferrer: enabled,
    referrerLevel: level 
  });
  await setupReferrerRules();
}
