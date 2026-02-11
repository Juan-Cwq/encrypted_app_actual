import { getProfile } from './profile-manager.js';
import { log } from '../shared/logger.js';

/**
 * CSP Injector (Manifest V3 compatible)
 * 
 * Note: Manifest V3 doesn't support blocking webRequest for header modification.
 * Instead, we use declarativeNetRequest for blocking third-party frames,
 * and use a non-blocking listener to monitor and log CSP-related events.
 * 
 * For CSP header modification, content scripts inject meta tags as a workaround.
 */

// Dynamic rule IDs for third-party frame blocking
const FRAME_BLOCK_RULE_BASE = 50000;

export async function initCSPInjector() {
  // Set up non-blocking listener for monitoring
  chrome.webRequest.onHeadersReceived.addListener(
    handleHeaders,
    { urls: ['<all_urls>'], types: ['main_frame', 'sub_frame'] },
    ['responseHeaders'] // No 'blocking' - just monitoring
  );

  // Set up dynamic rules for third-party frame blocking
  await setupFrameBlockingRules();
}

// Non-blocking header monitor
async function handleHeaders(details) {
  let origin;
  try {
    origin = new URL(details.url).origin;
  } catch {
    return;
  }

  const profile = await getProfile(origin);

  // Log CSP events for user awareness
  if (profile.injectCSP) {
    await log('network', 'csp-monitoring', origin, details.tabId, new URL(details.url).hostname);
  }

  // Log third-party frame detection (blocking is handled by declarativeNetRequest)
  if (profile.blockThirdPartyFrames && details.type === 'sub_frame') {
    try {
      const frameOrigin = new URL(details.url).origin;
      const parentOrigin = details.initiator;
      if (parentOrigin && frameOrigin !== parentOrigin) {
        await log('tracking', 'third-party-frame-detected', {
          frame: frameOrigin,
          parent: parentOrigin
        }, details.tabId, new URL(details.url).hostname);
      }
    } catch {}
  }
}

// Set up declarativeNetRequest rules for third-party frame blocking
async function setupFrameBlockingRules() {
  try {
    // Get current settings
    const { blockThirdPartyFrames = true } = await chrome.storage.local.get('blockThirdPartyFrames');
    
    if (blockThirdPartyFrames) {
      // Enable frame blocking via dynamic rules
      const rules = [{
        id: FRAME_BLOCK_RULE_BASE,
        priority: 1,
        action: { type: 'block' },
        condition: {
          resourceTypes: ['sub_frame'],
          domainType: 'thirdParty'
        }
      }];

      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [FRAME_BLOCK_RULE_BASE],
        addRules: rules
      });
    } else {
      // Remove frame blocking rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [FRAME_BLOCK_RULE_BASE]
      });
    }
  } catch (e) {
    console.error('Failed to setup frame blocking rules:', e);
  }
}

// Export for settings changes
export async function updateFrameBlocking(enabled) {
  await chrome.storage.local.set({ blockThirdPartyFrames: enabled });
  await setupFrameBlockingRules();
}

// Build CSP value (used by content script for meta tag injection)
export function buildCSP(profile) {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // unsafe-inline needed for most sites to function
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https:",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];

  if (profile.blockThirdPartyFrames) {
    directives.push("frame-src 'self'");
  } else {
    directives.push("frame-src 'self' https:");
  }

  return directives.join('; ');
}
