const PROFILE_FEATURES = {
  strict: { fingerprint: true, webrtc: true, pii: true, scripts: true },
  moderate: { fingerprint: true, webrtc: false, pii: true, scripts: false },
  minimal: { fingerprint: false, webrtc: false, pii: false, scripts: false }
};

let currentOrigin = '';
let currentTabId = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Get active tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      const url = new URL(tab.url);
      currentOrigin = url.origin;
      currentTabId = tab.id;
      document.getElementById('siteName').textContent = url.hostname;
    } catch {
      document.getElementById('siteName').textContent = 'Unknown site';
    }
  }

  // Check enabled state
  const { enabled } = await chrome.runtime.sendMessage({ type: 'isEnabled' });
  document.getElementById('masterToggle').checked = enabled;
  updateEnabledUI(enabled);

  // Load stats
  if (currentTabId) {
    const stats = await chrome.runtime.sendMessage({ type: 'getStats', tabId: currentTabId });
    document.getElementById('blockedCount').textContent = stats.blocked || 0;
    document.getElementById('fingerprintCount').textContent = stats.fingerprint || 0;
    document.getElementById('piiCount').textContent = stats.pii || 0;
    document.getElementById('scriptCount').textContent = stats.scripts || 0;
  }

  // Load current profile
  if (currentOrigin) {
    const { profile } = await chrome.runtime.sendMessage({ type: 'getProfile', origin: currentOrigin });
    if (profile) {
      setActiveProfile(profile.level);
    }
  }

  // Event listeners
  document.getElementById('masterToggle').addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await chrome.runtime.sendMessage({ type: 'setEnabled', enabled });
    updateEnabledUI(enabled);
  });

  document.querySelectorAll('.profile-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const level = btn.dataset.level;
      await chrome.runtime.sendMessage({ type: 'setProfile', origin: currentOrigin, level });
      setActiveProfile(level);
    });
  });

  document.getElementById('dashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
    window.close();
  });

  document.getElementById('nuclearBtn').addEventListener('click', async () => {
    if (confirm('This will clear ALL browsing data and reset Privacy Shield. Are you sure?')) {
      await chrome.runtime.sendMessage({ type: 'nuclearOption' });
      window.close();
    }
  });
}

function setActiveProfile(level) {
  document.querySelectorAll('.profile-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === level);
  });

  const features = PROFILE_FEATURES[level] || PROFILE_FEATURES.moderate;
  setFeature('featFingerprint', features.fingerprint);
  setFeature('featWebRTC', features.webrtc);
  setFeature('featPII', features.pii);
  setFeature('featScripts', features.scripts);
}

function setFeature(id, enabled) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('on', enabled);
}

function updateEnabledUI(enabled) {
  const overlay = document.getElementById('disabledOverlay');
  const sections = document.querySelectorAll('.stats, .profile-section, .features');
  if (enabled) {
    overlay.style.display = 'none';
    sections.forEach(s => s.style.display = '');
  } else {
    overlay.style.display = 'block';
    sections.forEach(s => s.style.display = 'none');
  }
}
