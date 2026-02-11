import { log } from '../shared/logger.js';

const UPGRADE_RULE_ID = 9999;

export async function initHttpsUpgrader() {
  // Add a dynamic rule to upgrade all HTTP requests to HTTPS
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [UPGRADE_RULE_ID],
      addRules: [
        {
          id: UPGRADE_RULE_ID,
          priority: 1,
          action: { type: 'upgradeScheme' },
          condition: {
            urlFilter: 'http://*',
            resourceTypes: [
              'main_frame', 'sub_frame', 'stylesheet', 'script',
              'image', 'font', 'xmlhttprequest', 'ping', 'media',
              'websocket', 'other'
            ]
          }
        }
      ]
    });
  } catch (e) {
    console.error('[Privacy Shield] Failed to init HTTPS upgrader:', e);
  }
}

export function handleHttpsUpgrade(details) {
  if (details.url.startsWith('http://')) {
    const upgraded = details.url.replace('http://', 'https://');
    log('tracking', 'https-upgrade', details.url, details.tabId, new URL(details.url).hostname);
    return { redirectUrl: upgraded };
  }
}
