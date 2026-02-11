import { get, set } from '../shared/storage.js';
import { log } from '../shared/logger.js';

const DYNAMIC_RULE_ID_START = 10000;
const UPDATE_ALARM_NAME = 'filter-list-update';

export function initFilterListUpdater() {
  // Set up periodic update alarm (every 24 hours)
  chrome.alarms.create(UPDATE_ALARM_NAME, {
    periodInMinutes: 24 * 60
  });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === UPDATE_ALARM_NAME) {
      updateFilterLists();
    }
  });
}

async function updateFilterLists() {
  try {
    // Load custom domain lists from storage (user or community-submitted)
    const customTrackers = (await get('customTrackerDomains')) || [];
    const customMining = (await get('customMiningDomains')) || [];
    const customMalicious = (await get('customMaliciousDomains')) || [];

    const allDomains = [
      ...customTrackers.map(d => ({ domain: d, type: 'tracker' })),
      ...customMining.map(d => ({ domain: d, type: 'miner' })),
      ...customMalicious.map(d => ({ domain: d, type: 'malicious' }))
    ];

    if (allDomains.length === 0) return;

    // Convert to declarativeNetRequest rules
    const rules = allDomains.map((entry, idx) => ({
      id: DYNAMIC_RULE_ID_START + idx,
      priority: 2,
      action: { type: 'block' },
      condition: {
        urlFilter: `||${entry.domain}`,
        resourceTypes: ['script', 'image', 'xmlhttprequest', 'sub_frame', 'ping', 'websocket', 'other']
      }
    }));

    // Get existing dynamic rule IDs to remove
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeIds = existingRules
      .filter(r => r.id >= DYNAMIC_RULE_ID_START)
      .map(r => r.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeIds,
      addRules: rules.slice(0, 5000) // Chrome limit
    });

    await set('lastFilterUpdate', Date.now());
    await log('tracking', 'filter-lists-updated', `${rules.length} dynamic rules applied`);

  } catch (e) {
    console.error('[Privacy Shield] Filter list update failed:', e);
  }
}

export { updateFilterLists };
