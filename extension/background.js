// Production Render API URL with chrome.storage override support
const DEFAULT_API_BASE = 'https://auto-url-saver.onrender.com/api/domains';
let API_BASE = DEFAULT_API_BASE;

// Load custom API URL from extension storage if set by user
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
  chrome.storage.sync.get(['backendUrl'], (result) => {
    if (result.backendUrl) {
      API_BASE = result.backendUrl.replace(/\/$/, '') + '/api/domains';
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.backendUrl) {
      API_BASE = changes.backendUrl.newValue.replace(/\/$/, '') + '/api/domains';
    }
  });
}


// Local cache of page URLs processed in this extension session
const processedUrls = new Set();

/**
 * Extract clean root domain from any subdomain or URL
 * e.g. "https://dashboard.render.com/web/..." -> "render.com"
 * e.g. "https://docs.google.com/..." -> "google.com"
 */
function extractRootDomain(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (hostname === 'localhost' || hostname === '127.0.0.1') return null;

    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;

    const secondLevelTLDs = ['co.uk', 'com.au', 'org.uk', 'co.in', 'net.au', 'gov.uk', 'ac.uk', 'edu.au'];
    const lastTwo = parts.slice(-2).join('.');
    if (secondLevelTLDs.includes(lastTwo) && parts.length > 2) {
      return parts.slice(-3).join('.');
    }

    return parts.slice(-2).join('.');
  } catch (err) {
    return null;
  }
}

/**
 * Process active tab page URL and sync with backend
 */
async function processTabDomain(url) {
  const rootDomain = extractRootDomain(url);
  if (!rootDomain) return;

  // Don't re-process exact same page URL multiple times in same session
  if (processedUrls.has(url)) {
    return;
  }

  try {
    // Check if auto-save enabled in chrome storage
    const storage = await chrome.storage.local.get(['autoSaveEnabled']);
    if (storage.autoSaveEnabled === false) {
      return;
    }

    processedUrls.add(url);

    // Send page URL & root domain to backend
    // Backend will either create root domain card or add page URL to visitedUrls array!
    const saveRes = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: rootDomain, fullUrl: url, url: url }),
    });

    if (saveRes.ok) {
      const saveJson = await saveRes.json();
      console.log(`[AutoDomainSaver] Processed URL "${url}" for root domain "${rootDomain}":`, saveJson);
    }
  } catch (err) {
    console.warn(`[AutoDomainSaver] Error communicating with backend: ${err.message}`);
    processedUrls.delete(url);
  }
}

// Listen to web navigation completion (Root Domain Auto Save + Visited URLs tracking)
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0 && details.url) {
    processTabDomain(details.url);
  }
});
