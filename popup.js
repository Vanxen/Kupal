document.addEventListener('DOMContentLoaded', function() {
  const statusText = document.getElementById('statusText');
  const statusIndicator = document.getElementById('statusIndicator');
  const logoutBtn = document.getElementById('logoutBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const discordBtn = document.getElementById('discordBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const autoLogoutToggle = document.getElementById('autoLogoutToggle');
  const forceLogoutToggle = document.getElementById('forceLogoutToggle');
  
  // Check current status
  checkStatus();
  
  // Load settings
  loadSettings();
  
  // Logout button click
  logoutBtn.addEventListener('click', function() {
    logoutBtn.innerHTML = '<span>⏳</span> LOGGING OUT...';
    logoutBtn.disabled = true;
    
    chrome.runtime.sendMessage({ action: "logoutNow" }, (response) => {
      setTimeout(() => {
        logoutBtn.innerHTML = '<span>✅</span> LOGGED OUT!';
        setTimeout(() => {
          logoutBtn.innerHTML = '<span>🚫</span> FORCE LOGOUT NOW';
          logoutBtn.disabled = false;
          checkStatus();
        }, 1500);
      }, 500);
    });
  });
  
  // Settings button click
  settingsBtn.addEventListener('click', function() {
    if (settingsPanel.classList.contains('hidden')) {
      settingsPanel.classList.remove('hidden');
      settingsBtn.innerHTML = '<span>⬆️</span> HIDE SETTINGS';
    } else {
      settingsPanel.classList.add('hidden');
      settingsBtn.innerHTML = '<span>⚙️</span> SETTINGS';
    }
  });
  
  // Discord button click
  discordBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://discord.gg/example' });
  });
  
  // Toggle changes
  autoLogoutToggle.addEventListener('change', function() {
    chrome.storage.local.set({ autoLogout: this.checked });
  });
  
  forceLogoutToggle.addEventListener('change', function() {
    chrome.storage.local.set({ forceLogout: this.checked });
  });
  
  // Functions
  function checkStatus() {
    chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
      if (response && response.loggedIn) {
        statusText.textContent = "LOGGED IN - UNSECURE";
        statusIndicator.className = "status-indicator status-logged-in";
      } else {
        statusText.textContent = "LOGGED OUT - SECURE";
        statusIndicator.className = "status-indicator status-logged-out";
      }
    });
  }
  
  function loadSettings() {
    chrome.storage.local.get(["autoLogout", "forceLogout"], (result) => {
      autoLogoutToggle.checked = result.autoLogout !== false;
      forceLogoutToggle.checked = result.forceLogout === true;
    });
  }
  
  // Auto-check status every 5 seconds
  setInterval(checkStatus, 5000);
});