// Tracking parameters to strip from URLs
export const TRACKING_PARAMS = [
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
  'ref', 'referrer',
  'hsCtaTracking', 'hsa_cam', 'hsa_grp', 'hsa_mt', 'hsa_src',
  'hsa_ad', 'hsa_acc', 'hsa_net', 'hsa_ver', 'hsa_la', 'hsa_ol', 'hsa_kw',
  'irclickid', 'irgwc',
  'wickedid',
  'rb_clickid',
  's_cid', 'si',
  '__s', '__hssc', '__hstc', '__hsfp',
  'trk_contact', 'trk_msg', 'trk_module', 'trk_sid',
  'igshid',
  'spm', 'scm'
];

// PII regex patterns
export const PII_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/,
  email: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}\b/,
  phone: /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  creditCard: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/
};

// Known tracker domains (top trackers for static rules)
export const TRACKER_DOMAINS = [
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'google-analytics.com', 'googletagmanager.com', 'googletagservices.com',
  'facebook.net', 'facebook.com/tr', 'connect.facebook.net',
  'analytics.twitter.com', 'ads-twitter.com', 't.co',
  'bat.bing.com', 'ads.linkedin.com', 'snap.licdn.com',
  'pixel.quantserve.com', 'quantcast.com',
  'scorecardresearch.com', 'imrworldwide.com',
  'amazon-adsystem.com', 'assoc-amazon.com',
  'criteo.com', 'criteo.net',
  'taboola.com', 'taboolasyndication.com',
  'outbrain.com', 'outbrainimg.com',
  'hotjar.com', 'static.hotjar.com',
  'mouseflow.com',
  'fullstory.com',
  'crazyegg.com',
  'mixpanel.com', 'mxpnl.com',
  'segment.com', 'segment.io',
  'amplitude.com',
  'heapanalytics.com',
  'optimizely.com',
  'demdex.net', 'omtrdc.net',
  'adnxs.com', 'adsrvr.org',
  'rubiconproject.com', 'pubmatic.com',
  'openx.net', 'casalemedia.com',
  'indexexchange.com', 'bidswitch.net',
  'smartadserver.com', 'contextweb.com',
  'moatads.com', 'doubleverify.com',
  'serving-sys.com', 'eyeota.net',
  'bluekai.com', 'exelator.com',
  'turn.com', 'mediamath.com',
  'mathtag.com', 'rlcdn.com',
  'sharethrough.com', 'spotxchange.com',
  'chartbeat.com', 'parsely.com',
  'newrelic.com', 'nr-data.net',
  'bugsnag.com', 'sentry.io'
];

// Known crypto-mining domains
export const MINING_DOMAINS = [
  'coinhive.com', 'coin-hive.com', 'authedmine.com',
  'crypto-loot.com', 'cryptoloot.pro',
  'jsecoin.com', 'jsE.coin',
  'monerominer.rocks', 'minero.cc',
  'webmine.cz', 'webminepool.com',
  'ppoi.org', 'projectpoi.com',
  'coinimp.com', 'afminer.com',
  'coinerra.com', 'minr.pw',
  'hashforcash.us', 'coinblind.com',
  'coinnebula.com', 'miner.pr0gramm.com',
  'minemytraffic.com', 'crypto.csgocpu.com',
  'worker.salon.com', 'webassembly.stream'
];

// Known malicious domain indicators (sample list)
export const MALICIOUS_DOMAINS = [
  // These would be populated from threat intelligence feeds
  // Placeholder entries for the updatable list structure
];

// Fingerprint spoofing configuration
export const FINGERPRINT_CONFIG = {
  canvas: {
    noiseLevel: 0.01 // subtle pixel noise
  },
  webgl: {
    vendor: 'Google Inc.',
    renderer: 'ANGLE (Generic GPU)'
  },
  audio: {
    noiseLevel: 0.0001
  },
  battery: {
    charging: true,
    chargingTime: 0,
    dischargingTime: Infinity,
    level: 1.0
  }
};

// Per-site profile defaults
export const PROFILE_DEFAULTS = {
  strict: {
    blockThirdPartyCookies: true,
    blockFingerprinting: true,
    blockWebRTC: true,
    blockThirdPartyFrames: true,
    stripReferrer: true,
    stripTrackingParams: true,
    blockPII: true,
    blockCryptoMiners: true,
    blockKeyloggers: true,
    upgradeHTTPS: true,
    injectCSP: true,
    monitorClipboard: true,
    monitorForms: true,
    analyzeScripts: true
  },
  moderate: {
    blockThirdPartyCookies: true,
    blockFingerprinting: true,
    blockWebRTC: false,
    blockThirdPartyFrames: false,
    stripReferrer: true,
    stripTrackingParams: true,
    blockPII: true,
    blockCryptoMiners: true,
    blockKeyloggers: true,
    upgradeHTTPS: true,
    injectCSP: false,
    monitorClipboard: true,
    monitorForms: true,
    analyzeScripts: false
  },
  minimal: {
    blockThirdPartyCookies: true,
    blockFingerprinting: false,
    blockWebRTC: false,
    blockThirdPartyFrames: false,
    stripReferrer: false,
    stripTrackingParams: true,
    blockPII: false,
    blockCryptoMiners: true,
    blockKeyloggers: false,
    upgradeHTTPS: true,
    injectCSP: false,
    monitorClipboard: false,
    monitorForms: false,
    analyzeScripts: false
  }
};

// Keylogger detection signatures
export const KEYLOGGER_SIGNATURES = [
  /addEventListener\s*\(\s*['"]key(down|up|press)['"]/,
  /onkey(down|up|press)\s*=/,
  /document\.onkey/,
  /\.keyCode|\.which|\.key\b/
];

// Suspicious script behavior thresholds
export const BEHAVIOR_THRESHOLDS = {
  maxLocalStorageAccessPerMinute: 50,
  maxNetworkRequestsPerMinute: 100,
  maxDOMQueriesPerMinute: 500
};
