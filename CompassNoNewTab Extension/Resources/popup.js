document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggleBtn');
  const status = document.getElementById('status');
  
  // Try different storage APIs for Safari compatibility
  function getStorage() {
    if (typeof browser !== 'undefined' && browser.storage) {
      return browser.storage.sync;
    }
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return chrome.storage.sync;
    }
    return null;
  }
  
  function getTabs() {
    if (typeof browser !== 'undefined' && browser.tabs) {
      return browser.tabs;
    }
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      return chrome.tabs;
    }
    return null;
  }
  
  const storage = getStorage();
  const tabs = getTabs();
  
  if (!storage) {
    status.textContent = 'Storage not available';
    toggleBtn.disabled = true;
    return;
  }
  
  // Load current state
  storage.get(['extensionEnabled']).then ?
    storage.get(['extensionEnabled']).then(function(result) {
      const isEnabled = result.extensionEnabled !== false;
      updateUI(isEnabled);
    }).catch(function() {
      updateUI(true); // Default to enabled
    }) :
    storage.get(['extensionEnabled'], function(result) {
      const isEnabled = result.extensionEnabled !== false;
      updateUI(isEnabled);
    });
  
  toggleBtn.addEventListener('click', function() {
    const currentEnabled = status.textContent.includes('enabled');
    const newState = !currentEnabled;
    
    const setData = {extensionEnabled: newState};
    
    if (storage.set.then) {
      // Promise-based API
      storage.set(setData).then(function() {
        updateUI(newState);
        reloadCurrentTab();
      });
    } else {
      // Callback-based API
      storage.set(setData, function() {
        updateUI(newState);
        reloadCurrentTab();
      });
    }
  });
  
  function reloadCurrentTab() {
    if (tabs) {
      if (tabs.query.then) {
        // Promise-based API
        tabs.query({active: true, currentWindow: true}).then(function(tabArray) {
          if (tabArray.length > 0) {
            tabs.reload(tabArray[0].id);
          }
        });
      } else {
        // Callback-based API
        tabs.query({active: true, currentWindow: true}, function(tabArray) {
          if (tabArray.length > 0) {
            tabs.reload(tabArray[0].id);
          }
        });
      }
    }
  }
  
  function updateUI(isEnabled) {
    if (isEnabled) {
      status.textContent = 'Extension is enabled';
      toggleBtn.textContent = 'Disable';
      toggleBtn.classList.remove('disabled');
    } else {
      status.textContent = 'Extension is disabled';
      toggleBtn.textContent = 'Enable';
      toggleBtn.classList.add('disabled');
    }
  }
});
