let activeTabId = null;
let className = 'stacker';

chrome.tabs.onActivated.addListener(function (tabInfo) {
  activeTabId = tabInfo.tabId;
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    chrome.tabs.get(tabId, function (tab) {
      if (tab && tab.url && activeTabId === tabId && tab.url.startsWith('http')) {
        chrome.storage.sync.set({ enabled: false });
      }
    });
  }
});

chrome.action.onClicked.addListener(function () {
  if (activeTabId !== null) {
    chrome.storage.sync.get('enabled', function (data) {
      const isEnabled = !data.enabled;
      chrome.storage.sync.set({ enabled: isEnabled });
      toggleCSSInjection(activeTabId, isEnabled);
      updateButtonIcon(activeTabId, isEnabled);
    });
  }
});

function toggleCSSInjection(tabId, isEnabled) {
  const cssFileURL = chrome.runtime.getURL('styles.css');

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: injectOrRemoveCSS,
    args: [isEnabled, cssFileURL, className]
  });
}

function injectOrRemoveCSS(isEnabled, cssFileURL, className) {
  const styleElement = document.querySelector('link[data-extension="true"]');
  const body = document.body;

  if (isEnabled && !styleElement && !body.classList.contains(className)) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = cssFileURL;
    style.setAttribute('data-extension', 'true');
    document.head.appendChild(style);

    body.classList.add(className);
  } else if (!isEnabled && styleElement && body.classList.contains(className)) {
    body.classList.remove(className);
    setTimeout(() => {
        styleElement.remove();
    }, 2000);
  }
}

function updateButtonIcon(tabId, isEnabled) {
  const path = isEnabled ? {
    "16": "icon_enabled.png",
    "48": "icon_enabled.png",
    "128": "icon_enabled.png"
  } : {
    "16": "icon_disabled.png",
    "48": "icon_disabled.png",
    "128": "icon_disabled.png"
  };

  chrome.action.setIcon({ tabId: tabId, path: path });
}
