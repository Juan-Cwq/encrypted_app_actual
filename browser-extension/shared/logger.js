import { appendLog, incrementStat } from './storage.js';

const CATEGORY_STAT_MAP = {
  tracking: 'blocked',
  fingerprint: 'fingerprint',
  network: 'pii',
  form: 'pii',
  script: 'scripts'
};

export async function log(category, action, detail, tabId, domain) {
  const entry = {
    category,
    action,
    detail: typeof detail === 'string' ? detail : JSON.stringify(detail),
    tabId: tabId || null,
    domain: domain || null
  };

  await appendLog(entry);

  // Update per-tab stats
  if (tabId && CATEGORY_STAT_MAP[category]) {
    await incrementStat(tabId, CATEGORY_STAT_MAP[category]);
  }
}
