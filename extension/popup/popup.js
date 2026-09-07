const DEFAULT_API_BASE = 'https://auto-url-saver.onrender.com/api/domains';
let API_BASE = DEFAULT_API_BASE;

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
  chrome.storage.sync.get(['backendUrl'], (result) => {
    if (result && result.backendUrl) {
      API_BASE = result.backendUrl.replace(/\/$/, '') + '/api/domains';
    }
  });
}

function extractRootDomain(hostname) {
  if (!hostname) return '';
  let clean = hostname.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split(':')[0];

  const parts = clean.split('.');
  if (parts.length <= 2) return clean;

  const secondLevelTLDs = ['co.uk', 'com.au', 'org.uk', 'co.in', 'net.au', 'gov.uk', 'ac.uk', 'edu.au'];
  const lastTwo = parts.slice(-2).join('.');
  if (secondLevelTLDs.includes(lastTwo) && parts.length > 2) {
    return parts.slice(-3).join('.');
  }

  return parts.slice(-2).join('.');
}

document.addEventListener('DOMContentLoaded', () => {
  const domainText = document.getElementById('domainText');
  const domainTitle = document.getElementById('domainTitle');
  const domainStatusMsg = document.getElementById('domainStatusMsg');
  const toggleAutoSave = document.getElementById('toggleAutoSave');
  const openDashboardBtn = document.getElementById('openDashboardBtn');

  // Load AutoSave toggle state
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['autoSaveEnabled'], (storage) => {
      if (toggleAutoSave) {
        toggleAutoSave.checked = storage && storage.autoSaveEnabled !== false;
      }
    });
  }

  if (toggleAutoSave) {
    toggleAutoSave.addEventListener('change', (e) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ autoSaveEnabled: e.target.checked });
      }
    });
  }

  if (openDashboardBtn) {
    openDashboardBtn.addEventListener('click', () => {
      const dashboardUrl = 'https://urlsaver.sickykumar.in';
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: dashboardUrl });
      } else {
        window.open(dashboardUrl, '_blank');
      }
    });
  }

  // Query active tab
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].url) {
        if (domainTitle) domainTitle.textContent = 'No Active Tab';
        if (domainStatusMsg) domainStatusMsg.textContent = '-';
        return;
      }

      try {
        const url = new URL(tabs[0].url);
        const rootDomain = extractRootDomain(url.hostname);

        if (!rootDomain) {
          if (domainTitle) domainTitle.textContent = 'Special Page';
          if (domainText) domainText.textContent = 'Internal Browser Page';
          if (domainStatusMsg) domainStatusMsg.textContent = 'Ignored';
          return;
        }

        if (domainTitle) domainTitle.textContent = rootDomain;
        if (domainText) domainText.textContent = rootDomain;

        // Check duplicate with backend
        const res = await fetch(`${API_BASE}/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: rootDomain }),
        });

        if (res.ok) {
          const json = await res.json();
          if (domainStatusMsg) {
            if (json.alreadySaved) {
              domainStatusMsg.textContent = 'Already saved ✓';
              domainStatusMsg.style.color = '#4ade80';
            } else {
              domainStatusMsg.textContent = 'Auto-saving...';
              domainStatusMsg.style.color = '#38bdf8';
            }
          }
        }
      } catch (err) {
        if (domainStatusMsg) {
          domainStatusMsg.textContent = 'Offline';
          domainStatusMsg.style.color = '#f87171';
        }
      }
    });
  }
});


