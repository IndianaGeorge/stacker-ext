document.addEventListener('DOMContentLoaded', function() {
    var activateButton = document.getElementById('activateButton');
    var injectedClass = 'stacker';
  
    activateButton.addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: toggleCSS,
          args: [injectedClass]
        });
      });
    });
  
    function toggleCSS(injectedClass) {
      var cssFileURL = chrome.runtime.getURL('styles.css');
      var body = document.body;
  
      var styleElement = document.querySelector('link[data-extension="true"]');
      var style = styleElement ? styleElement : null;
  
      if (style && body.classList.contains(injectedClass)) {
        style.remove();
        body.classList.remove(injectedClass);
      } else {
        style = document.createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = cssFileURL;
        style.setAttribute('data-extension', 'true');
        document.head.appendChild(style);
  
        body.classList.add(injectedClass);
      }
    }
  });
  