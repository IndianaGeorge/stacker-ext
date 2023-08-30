let className = 'stacker-1-0';

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    chrome.tabs.get(tabId, function (tab) {
      if (tab && tab.url && tab.active && tab.url.startsWith('http')) {
        chrome.storage.sync.set({ enabled: false });
      }
    });
  }
});

chrome.tabs.onRemoved.addListener(function () {
  chrome.storage.sync.clear();
});

chrome.action.onClicked.addListener(function () {
  chrome.storage.sync.get('enabled', function (data) {
    const isEnabled = !data.enabled;
    chrome.storage.sync.set({ enabled: isEnabled });
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      if ((tabs.length > 0) && (tabs[0].url.startsWith('http'))) {
        toggleCSSInjection(tabs[0].id);
        updateButtonIcon(tabs[0].id, isEnabled);  
      }
    });
  });
});

function toggleCSSInjection(tabId) {
  const cssFileURL = chrome.runtime.getURL('styles.css');

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: injectOrRemoveCSS,
    args: [cssFileURL, className]
  });
}

function injectOrRemoveCSS(cssFileURL, className) {
  if (!document.body.classList.contains(className)) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = cssFileURL;
    style.setAttribute('stacker-effect-applied', 'true');
    document.head.appendChild(style);

    document.body.classList.add(className);
  } else if (document.body.classList.contains(className)) {
    document.body.classList.remove(className);
    setTimeout(() => {
        const styleElement = document.querySelector('link[stacker-effect-applied="true"]');
        if (styleElement) {
          styleElement.remove();
        }
    }, 2000);
  }
}

function updateButtonIcon(tabId, isEnabled) {
  const path = isEnabled ? {
    "16": "enabled16.png",
    "48": "enabled48.png",
    "128": "enabled128.png"
  } : {
    "16": "disabled16.png",
    "48": "disabled48.png",
    "128": "disabled128.png"
  };

  chrome.action.setIcon({ tabId: tabId, path: path });
}
