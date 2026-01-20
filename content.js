// Content script that runs on Roblox pages
console.log("Hayop Ka Ah content script loaded");

// Function to force logout on Roblox page
function forceRobloxLogout() {
  // Method 1: Clear local tokens
  if (window.Roblox && window.Roblox.Endpoints) {
    console.log("Roblox global object found, attempting logout...");
  }
  
  // Method 2: Navigate to logout endpoint
  const logoutUrl = "https://www.roblox.com/logout";
  if (window.location.href !== logoutUrl) {
    window.location.href = logoutUrl;
  }
  
  // Method 3: Remove login indicators from DOM
  const loginIndicators = document.querySelectorAll(
    '[data-testid="nav-profile"], .avatar-container, .user-name'
  );
  loginIndicators.forEach(el => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
  
  // Clear any remaining auth data
  try {
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/;domain=.roblox.com`);
    });
  } catch (e) {
    console.warn("Cookie cleanup failed:", e);
  }
}

// Check if user appears logged in
function checkLoginStatus() {
  const loggedInElements = [
    document.querySelector('.icon-nav-avatar'),
    document.querySelector('[data-testid="nav-profile"]'),
    document.querySelector('.avatar-container')
  ];
  
  return loggedInElements.some(el => el !== null);
}

// Execute on page load
if (window.location.hostname.includes("roblox.com")) {
  setTimeout(() => {
    // Send status to background
    chrome.runtime.sendMessage({
      action: "reportStatus",
      isLoggedIn: checkLoginStatus()
    });
    
    // Force logout if needed
    chrome.storage.local.get(["forceLogout"], (result) => {
      if (result.forceLogout !== false && checkLoginStatus()) {
        console.log("Force logging out from Roblox...");
        forceRobloxLogout();
      }
    });
  }, 2000);
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "logoutFromPage") {
    forceRobloxLogout();
    sendResponse({ success: true });
  } else if (request.action === "checkStatus") {
    sendResponse({ loggedIn: checkLoginStatus() });
  }
  return true;
});