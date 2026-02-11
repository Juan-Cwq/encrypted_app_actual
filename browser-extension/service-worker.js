import { initDefaults, getStats, get } from './shared/storage.js';
import { log } from './shared/logger.js';
import { getProfile, setProfile, isEnabled, setEnabled } from './background/profile-manager.js';
import { initHttpsUpgrader } from './background/https-upgrader.js';
import { initReferrerStripper } from './background/referrer-stripper.js';
import { initRequestInterceptor } from './background/request-interceptor.js';
import { initCSPInjector } from './background/csp-injector.js';
import { initFilterListUpdater } from './background/filter-list-updater.js';

// ===== Installation & Startup =====

chrome.runtime.onInstalled.addListener(async (details) => {
  await initDefaults();
  await initHttpsUpgrader();
  console.log('[Privacy Shield] Installed:', details.reason);
});

chrome.runtime.onStartup.addListener(async () => {
  await initHttpsUpgrader();
});

// ===== Initialize Modules =====

// Initialize modules (some are async for declarativeNetRequest setup)
(async () => {
  await initReferrerStripper();
  await initCSPInjector();
})();

initRequestInterceptor();
initFilterListUpdater();

// ===== Message Router =====

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true; // async response
});

async function handleMessage(message, sender) {
  const tabId = sender.tab?.id;

  switch (message.type) {
    case 'getProfile': {
      const enabled = await isEnabled();
      if (!enabled) return { enabled: false, profile: null };
      const profile = await getProfile(message.origin);
      return { enabled: true, profile };
    }

    case 'setProfile': {
      await setProfile(message.origin, message.level);
      return { success: true };
    }

    case 'getStats': {
      const stats = await getStats(message.tabId || tabId);
      return stats;
    }

    case 'setEnabled': {
      await setEnabled(message.enabled);
      return { success: true };
    }

    case 'isEnabled': {
      return { enabled: await isEnabled() };
    }

    case 'log': {
      await log(
        message.category,
        message.action,
        message.detail,
        tabId,
        message.domain
      );
      return { success: true };
    }

    case 'nuclearOption': {
      await chrome.browsingData.remove({}, {
        applyCache: true,
        cache: true,
        cookies: true,
        history: true,
        indexedDB: true,
        localStorage: true,
        passwords: false, // don't wipe passwords by default
        serviceWorkers: true,
        webSQL: true
      });
      await initDefaults();
      return { success: true };
    }

    case 'getLogs': {
      const { getLogs } = await import('./shared/storage.js');
      return await getLogs(message.filter || {});
    }

    case 'clearLogs': {
      const { clearLogs } = await import('./shared/storage.js');
      await clearLogs();
      return { success: true };
    }

    case 'exportLogs': {
      const { getLogs: getAll } = await import('./shared/storage.js');
      return await getAll();
    }

    default:
      return { error: 'Unknown message type' };
  }
}

// ===== Tab Cleanup =====

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { clearTabStats } = await import('./shared/storage.js');
  await clearTabStats(tabId);
});

// ===== Badge Update =====

chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener(async (info) => {
  const tabId = info.request.tabId;
  if (tabId > 0) {
    const stats = await getStats(tabId);
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    chrome.action.setBadgeText({ text: total > 0 ? String(total) : '', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#e94560', tabId });
  }
});
