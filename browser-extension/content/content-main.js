// Privacy Shield — Content Script Orchestrator
// Runs at document_start in all frames

(async function () {
  // Check if extension is enabled
  const response = await chrome.runtime.sendMessage({ type: 'getProfile', origin: window.location.origin });
  if (!response || !response.enabled) return;

  const profile = response.profile;

  // Inject fingerprint shield into MAIN world (must happen before page scripts)
  if (profile.blockFingerprinting) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('content/fingerprint-shield.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  }

  // WebRTC shield (MAIN world injection)
  if (profile.blockWebRTC) {
    const script = document.createElement('script');
    script.textContent = getWebRTCShieldCode(profile.level);
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }

  // Form protector
  if (profile.monitorForms || profile.monitorClipboard) {
    initFormProtector(profile);
  }

  // Script analyzer
  if (profile.analyzeScripts || profile.blockKeyloggers || profile.blockCryptoMiners) {
    initScriptAnalyzer(profile);
  }
})();

// ===== WebRTC Shield (inline for MAIN world) =====

function getWebRTCShieldCode(level) {
  if (level === 'strict') {
    return `
      (function() {
        const noop = function() {};
        window.RTCPeerConnection = function() { throw new DOMException('RTCPeerConnection blocked by Privacy Shield', 'NotAllowedError'); };
        window.webkitRTCPeerConnection = window.RTCPeerConnection;
        window.mozRTCPeerConnection = window.RTCPeerConnection;
      })();
    `;
  }
  // Moderate: allow connections but strip local IP candidates
  return `
    (function() {
      const OrigRTC = window.RTCPeerConnection || window.webkitRTCPeerConnection;
      if (!OrigRTC) return;

      const localIPPattern = /(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)/;

      window.RTCPeerConnection = function(...args) {
        const pc = new OrigRTC(...args);
        const origAddEventListener = pc.addEventListener.bind(pc);

        pc.addEventListener = function(type, listener, ...rest) {
          if (type === 'icecandidate') {
            const wrapped = function(event) {
              if (event.candidate && localIPPattern.test(event.candidate.candidate)) {
                return; // suppress local IP candidates
              }
              listener.call(this, event);
            };
            return origAddEventListener(type, wrapped, ...rest);
          }
          return origAddEventListener(type, listener, ...rest);
        };

        Object.defineProperty(pc, 'onicecandidate', {
          set(fn) {
            pc.addEventListener('icecandidate', fn);
          }
        });

        return pc;
      };

      window.RTCPeerConnection.prototype = OrigRTC.prototype;
      window.webkitRTCPeerConnection = window.RTCPeerConnection;
    })();
  `;
}

// ===== Form Protector =====

function initFormProtector(profile) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => runFormProtector(profile));
  } else {
    runFormProtector(profile);
  }
}

function runFormProtector(profile) {
  // Detect autofill hijacking (hidden fields)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        const inputs = node.tagName === 'INPUT' ? [node] : [...(node.querySelectorAll?.('input') || [])];
        for (const input of inputs) {
          const style = window.getComputedStyle(input);
          const isHidden = style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0' ||
            parseInt(style.height) <= 1 ||
            parseInt(style.width) <= 1 ||
            input.offsetParent === null;

          if (isHidden && (input.autocomplete !== 'off' && input.autocomplete !== 'new-password')) {
            chrome.runtime.sendMessage({
              type: 'log',
              category: 'form',
              action: 'autofill-hijack-detected',
              detail: `Hidden input: name=${input.name}, type=${input.type}`,
              domain: window.location.hostname
            });
            input.autocomplete = 'off';
            input.setAttribute('data-ps-blocked', 'autofill-hijack');
          }
        }
      }
    }
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  // Monitor form submissions to third-party domains
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!form || form.tagName !== 'FORM') return;

    try {
      const actionUrl = new URL(form.action || window.location.href, window.location.origin);
      const currentOrigin = window.location.origin;

      if (actionUrl.origin !== currentOrigin) {
        e.preventDefault();
        showWarningBanner(
          `This form submits data to a third-party domain: ${actionUrl.hostname}`,
          () => form.submit(),
          () => {}
        );
        chrome.runtime.sendMessage({
          type: 'log',
          category: 'form',
          action: 'third-party-form-warning',
          detail: `Form action: ${actionUrl.hostname}`,
          domain: window.location.hostname
        });
      }
    } catch {}
  }, true);

  // Monitor clipboard access
  if (profile.monitorClipboard) {
    document.addEventListener('paste', (e) => {
      const text = e.clipboardData?.getData('text') || '';
      const PII_PATTERNS = {
        ssn: /\b\d{3}-\d{2}-\d{4}\b/,
        creditCard: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/,
      };

      for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
        if (pattern.test(text)) {
          e.preventDefault();
          showWarningBanner(
            `Clipboard contains sensitive data (${type}). Allow paste?`,
            () => {
              const target = e.target;
              if (target && target.value !== undefined) {
                target.value += text;
              }
            },
            () => {}
          );
          chrome.runtime.sendMessage({
            type: 'log',
            category: 'form',
            action: 'clipboard-pii-blocked',
            detail: `PII type: ${type}`,
            domain: window.location.hostname
          });
          break;
        }
      }
    }, true);
  }
}

// ===== Script Analyzer =====

function initScriptAnalyzer(profile) {
  const KEYLOGGER_PATTERNS = [
    /addEventListener\s*\(\s*['"]key(down|up|press)['"]/,
    /onkey(down|up|press)\s*=/,
  ];

  const MINER_PATTERNS = [
    /coinhive/i, /cryptonight/i, /CryptoNoter/i,
    /webminer/i, /cpuminer/i, /hashrate/i,
  ];

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE || node.tagName !== 'SCRIPT') continue;

        // Check external script src against mining domains
        if (node.src) {
          try {
            const srcHost = new URL(node.src).hostname;
            const MINING_DOMAINS = [
              'coinhive.com', 'coin-hive.com', 'authedmine.com',
              'crypto-loot.com', 'cryptoloot.pro', 'jsecoin.com',
              'monerominer.rocks', 'minero.cc', 'webmine.cz',
              'coinimp.com', 'afminer.com', 'minr.pw'
            ];
            if (MINING_DOMAINS.some(d => srcHost.includes(d))) {
              node.remove();
              chrome.runtime.sendMessage({
                type: 'log',
                category: 'script',
                action: 'crypto-miner-blocked',
                detail: node.src,
                domain: window.location.hostname
              });
              continue;
            }
          } catch {}
        }

        // Check inline script content
        const content = node.textContent;
        if (!content) continue;

        if (profile.blockCryptoMiners) {
          for (const pattern of MINER_PATTERNS) {
            if (pattern.test(content)) {
              node.remove();
              chrome.runtime.sendMessage({
                type: 'log',
                category: 'script',
                action: 'crypto-miner-blocked',
                detail: 'Inline crypto-mining script detected',
                domain: window.location.hostname
              });
              break;
            }
          }
        }

        if (profile.blockKeyloggers) {
          for (const pattern of KEYLOGGER_PATTERNS) {
            if (pattern.test(content)) {
              // Check if it also sends data externally
              const sendsData = /fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|new\s+WebSocket/.test(content);
              if (sendsData) {
                node.remove();
                chrome.runtime.sendMessage({
                  type: 'log',
                  category: 'script',
                  action: 'keylogger-blocked',
                  detail: 'Script with key capture + external data transmission',
                  domain: window.location.hostname
                });
              }
              break;
            }
          }
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

// ===== UI Helpers =====

function showWarningBanner(message, onAllow, onBlock) {
  const banner = document.createElement('div');
  banner.setAttribute('style', `
    position: fixed; top: 0; left: 0; right: 0; z-index: 2147483647;
    background: #1a1a2e; color: #e0e0e0; padding: 16px 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px; display: flex; align-items: center; gap: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5); border-bottom: 2px solid #e94560;
  `);

  const icon = document.createElement('span');
  icon.textContent = '\u26A0';
  icon.setAttribute('style', 'font-size: 20px; color: #e94560;');

  const text = document.createElement('span');
  text.textContent = `Privacy Shield: ${message}`;
  text.setAttribute('style', 'flex: 1;');

  const allowBtn = document.createElement('button');
  allowBtn.textContent = 'Allow';
  allowBtn.setAttribute('style', 'background: #0f3460; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;');
  allowBtn.onclick = () => { banner.remove(); onAllow(); };

  const blockBtn = document.createElement('button');
  blockBtn.textContent = 'Block';
  blockBtn.setAttribute('style', 'background: #e94560; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;');
  blockBtn.onclick = () => { banner.remove(); onBlock(); };

  banner.append(icon, text, allowBtn, blockBtn);
  document.documentElement.appendChild(banner);

  // Auto-dismiss after 15 seconds (block by default)
  setTimeout(() => {
    if (banner.parentNode) {
      banner.remove();
      onBlock();
    }
  }, 15000);
}
