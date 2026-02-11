// URL Cleaner — strips tracking parameters from URLs
// Runs as part of content script

const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'utm_name', 'utm_cid', 'utm_reader', 'utm_viz_id', 'utm_pubreferrer',
  'utm_swu', 'utm_social', 'utm_social-type',
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'gbraid', 'wbraid',
  'msclkid', 'twclid', 'li_fat_id',
  'mc_cid', 'mc_eid',
  '_ga', '_gid', '_gl',
  'yclid', 'ymclid',
  'epik', '_openstat',
  'vero_id', 'vero_conv',
  'hsCtaTracking', 'hsa_cam', 'hsa_grp', 'hsa_mt', 'hsa_src',
  'hsa_ad', 'hsa_acc', 'hsa_net', 'hsa_ver', 'hsa_la', 'hsa_ol', 'hsa_kw',
  'irclickid', 'irgwc',
  'wickedid', 'rb_clickid',
  's_cid', 'si',
  '__s', '__hssc', '__hstc', '__hsfp',
  'trk_contact', 'trk_msg', 'trk_module', 'trk_sid',
  'igshid', 'spm', 'scm'
];

const TRACKING_PARAM_SET = new Set(TRACKING_PARAMS);

function cleanUrl(url) {
  try {
    const parsed = new URL(url);
    let changed = false;

    for (const param of [...parsed.searchParams.keys()]) {
      if (TRACKING_PARAM_SET.has(param)) {
        parsed.searchParams.delete(param);
        changed = true;
      }
    }

    return changed ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function cleanCurrentUrl() {
  const cleaned = cleanUrl(window.location.href);
  if (cleaned && cleaned !== window.location.href) {
    window.history.replaceState(null, '', cleaned);
    chrome.runtime.sendMessage({
      type: 'log',
      category: 'tracking',
      action: 'url-params-stripped',
      detail: window.location.href,
      domain: window.location.hostname
    });
  }
}

function cleanLinks() {
  const links = document.querySelectorAll('a[href]');
  let count = 0;

  for (const link of links) {
    const cleaned = cleanUrl(link.href);
    if (cleaned) {
      link.href = cleaned;
      count++;
    }
  }

  if (count > 0) {
    chrome.runtime.sendMessage({
      type: 'log',
      category: 'tracking',
      action: 'links-cleaned',
      detail: `${count} links cleaned`,
      domain: window.location.hostname
    });
  }
}

// Intercept history API to clean navigated URLs
const origPushState = history.pushState;
const origReplaceState = history.replaceState;

history.pushState = function (state, title, url) {
  if (url) {
    const cleaned = cleanUrl(new URL(url, window.location.origin).href);
    if (cleaned) url = cleaned;
  }
  return origPushState.call(this, state, title, url);
};

history.replaceState = function (state, title, url) {
  if (url) {
    const cleaned = cleanUrl(new URL(url, window.location.origin).href);
    if (cleaned) url = cleaned;
  }
  return origReplaceState.call(this, state, title, url);
};

// Run on page load
cleanCurrentUrl();

// Clean links once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', cleanLinks);
} else {
  cleanLinks();
}

// Watch for dynamically added links
const linkObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'A' && node.href) {
          const cleaned = cleanUrl(node.href);
          if (cleaned) node.href = cleaned;
        }
        const innerLinks = node.querySelectorAll?.('a[href]');
        if (innerLinks) {
          for (const link of innerLinks) {
            const cleaned = cleanUrl(link.href);
            if (cleaned) link.href = cleaned;
          }
        }
      }
    }
  }
});

linkObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
