# Haven Privacy Proxy

A local HTTP/HTTPS proxy with comprehensive privacy protection. Unlike browser extensions (limited by Manifest V3 restrictions), this runs locally with **full network interception capabilities**.

## Important: YouTube Ad Blocking

**YouTube ads are challenging** because they're served from the same domains as video content. For best results, use this proxy **together with**:

1. **uBlock Origin** browser extension (handles in-page ad elements)
2. **This proxy** (blocks tracking, third-party ads, and ad requests)

For complete YouTube ad blocking without extensions, you'll need to install the proxy's CA certificate (see below).

## Features

- **Tracker Blocking** - Blocks 100+ known tracking domains
- **Ad Blocking** - Blocks advertising networks and ad servers
- **PII Protection** - Detects and blocks sensitive data (SSN, credit cards, emails, phone numbers) from leaking
- **Referrer Stripping** - Removes tracking referrer information from requests
- **Cookie Sanitization** - Removes tracking cookies, enhances cookie security
- **HTTPS Upgrade** - Automatically upgrades HTTP connections to HTTPS
- **Malware Blocking** - Blocks known malicious domains
- **Cryptominer Blocking** - Blocks browser-based cryptocurrency miners

## Quick Start

### 1. Install Dependencies

```bash
cd privacy-proxy
npm install
```

### 2. Start the Proxy

```bash
npm start
```

The proxy will start on port **8888** and the dashboard on port **8889**.

### 3. Configure Your Browser/System

#### Option A: Browser-only (Firefox)
1. Open Firefox Settings → General → Network Settings
2. Select "Manual proxy configuration"
3. HTTP Proxy: `127.0.0.1` Port: `8888`
4. Check "Also use this proxy for HTTPS"

#### Option B: Browser-only (Chrome)
Use an extension like "Proxy SwitchyOmega" to route traffic through `127.0.0.1:8888`

#### Option C: System-wide (macOS)
1. System Preferences → Network → Advanced → Proxies
2. Enable "Web Proxy (HTTP)" and "Secure Web Proxy (HTTPS)"
3. Set server to `127.0.0.1` and port to `8888`

### 4. View the Dashboard

Open http://localhost:8889 to see:
- Real-time statistics
- Block logs
- Feature toggles
- Blocklist management

## How It Works

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Browser   │────▶│  Haven Privacy   │────▶│   Internet   │
│             │     │      Proxy       │     │              │
└─────────────┘     └──────────────────┘     └──────────────┘
                           │
                    ┌──────┴──────┐
                    │  Features:  │
                    │ • Blocking  │
                    │ • PII Scan  │
                    │ • Headers   │
                    │ • Cookies   │
                    └─────────────┘
```

1. **All HTTP/HTTPS traffic** from your browser goes through the proxy
2. **Blocklist check** - Tracker/ad/malware domains are blocked immediately
3. **PII scan** - URLs and request bodies are scanned for sensitive data
4. **Header sanitization** - Referrers stripped, fingerprinting headers removed
5. **Cookie sanitization** - Tracking cookies blocked, security enhanced
6. **Clean request** forwarded to the destination

## Why a Local Proxy?

Browser extensions (Manifest V3) have significant limitations:
- Cannot use blocking `webRequest` API
- Limited to declarative rules only
- Cannot inspect request bodies
- Cannot dynamically block based on content

A local proxy has **no such restrictions**:
- Full request/response inspection
- Dynamic blocking based on any criteria
- PII detection in request bodies
- Complete header control
- Works across all browsers

## Configuration

Edit `src/index.js` to customize:

```javascript
const CONFIG = {
  proxyPort: 8888,        // Proxy listening port
  dashboardPort: 8889,    // Dashboard web UI port
  
  features: {
    blockTrackers: true,   // Block tracking domains
    blockAds: true,        // Block ad networks
    blockMalware: true,    // Block malicious domains
    blockPII: true,        // Block PII leaks
    stripReferrer: true,   // Strip referrer headers
    sanitizeCookies: true, // Sanitize cookies
    upgradeHTTPS: true,    // Upgrade to HTTPS
    blockMining: true      // Block cryptominers
  },
  
  verbose: false  // Enable verbose console logging
};
```

## Updating Blocklists

Blocklists are stored in the `rules/` directory as JSON files:
- `trackers.json` - Tracking domains
- `ads.json` - Advertising domains  
- `malware.json` - Malicious domains
- `miners.json` - Cryptominer domains

Add custom domains through the dashboard or edit files directly.

## YouTube Ad Blocking (HTTPS Inspection)

YouTube (and similar platforms) serve ads from the same domains as content, making them impossible to block by hostname alone. The proxy needs to inspect the actual URLs, which requires HTTPS interception.

### To enable YouTube ad blocking:

1. **Install the CA certificate:**

   **macOS:**
   ```bash
   # Open Keychain Access and import the certificate
   open certs/haven-ca.pem
   # Then double-click the certificate → Trust → "Always Trust"
   ```

   **Windows:**
   ```
   - Double-click certs/haven-ca.pem
   - Click "Install Certificate"
   - Choose "Local Machine" → "Trusted Root Certification Authorities"
   ```

   **Linux (Chrome/Chromium):**
   ```bash
   certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "Haven CA" -i certs/haven-ca.pem
   ```

   **Firefox (all platforms):**
   ```
   Settings → Privacy & Security → Certificates → View Certificates → Import
   ```

2. **Restart your browser** after installing the certificate.

3. **The proxy will now intercept** YouTube and similar domains to block ads at the URL level.

### How it works:

Without CA installed:
```
Browser ←—HTTPS tunnel—→ Proxy ←—HTTPS tunnel—→ youtube.com
                ↑
         (only sees hostname,
          can't block specific ad URLs)
```

With CA installed:
```
Browser ←—HTTPS—→ Proxy ←—HTTPS—→ youtube.com
              ↑
    (decrypts, inspects URLs,
     blocks ad requests, re-encrypts)
```

### Disable MITM if not needed:

Set `mitmEnabled: false` in `src/index.js` to disable HTTPS inspection.

## Security Considerations

- The proxy runs **locally only** - no data leaves your machine
- Logs are stored locally in the `logs/` directory
- No cloud dependencies or external services
- Open source - audit the code yourself

## License

MIT - Part of the Haven Privacy Suite
