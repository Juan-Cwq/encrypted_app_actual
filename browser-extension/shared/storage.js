const MAX_LOG_ENTRIES = 10000;
const LOG_PRUNE_COUNT = 2000;

export async function get(key) {
  const result = await chrome.storage.local.get(key);
  return result[key];
}

export async function set(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

export async function getAll(keys) {
  return chrome.storage.local.get(keys);
}

export async function appendLog(entry) {
  const logs = (await get('privacyLogs')) || [];
  logs.push({
    ...entry,
    timestamp: Date.now()
  });

  // Prune oldest entries if over limit
  if (logs.length > MAX_LOG_ENTRIES) {
    logs.splice(0, LOG_PRUNE_COUNT);
  }

  await set('privacyLogs', logs);
}

export async function getLogs(filter = {}) {
  let logs = (await get('privacyLogs')) || [];

  if (filter.category) {
    logs = logs.filter(l => l.category === filter.category);
  }
  if (filter.domain) {
    logs = logs.filter(l => l.domain === filter.domain);
  }
  if (filter.since) {
    logs = logs.filter(l => l.timestamp >= filter.since);
  }

  return logs;
}

export async function clearLogs() {
  await set('privacyLogs', []);
}

export async function getStats(tabId) {
  const stats = (await get('tabStats')) || {};
  return stats[tabId] || { blocked: 0, fingerprint: 0, pii: 0, scripts: 0 };
}

export async function incrementStat(tabId, category) {
  const allStats = (await get('tabStats')) || {};
  if (!allStats[tabId]) {
    allStats[tabId] = { blocked: 0, fingerprint: 0, pii: 0, scripts: 0 };
  }
  allStats[tabId][category] = (allStats[tabId][category] || 0) + 1;
  await set('tabStats', allStats);
}

export async function clearTabStats(tabId) {
  const allStats = (await get('tabStats')) || {};
  delete allStats[tabId];
  await set('tabStats', allStats);
}

// Initialize default settings on first install
export async function initDefaults() {
  const existing = await get('settings');
  if (!existing) {
    await set('settings', {
      defaultProfile: 'moderate',
      enabled: true
    });
  }
  const profiles = await get('siteProfiles');
  if (!profiles) {
    await set('siteProfiles', {});
  }
  const whitelist = await get('cookieWhitelist');
  if (!whitelist) {
    await set('cookieWhitelist', []);
  }
  const logs = await get('privacyLogs');
  if (!logs) {
    await set('privacyLogs', []);
  }
}
