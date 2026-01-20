// Content script for Roblox pages
console.log("Hayop Ka Ah: Content script loaded");

function forceRobloxLogout() {
  console.log("Hayop Ka Ah: Forcing logout...");
  
  // Method 1: Redirect to logout
  if (!window.location.href.includes('/logout')) {
    window.location.href = 'https://roblox.com/logout';
    return;
  }
  
  // Method 2: Clear local data
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log("Cleared browser storage");
  } catch (e) {
    console.warn("Could not clear storage");
  }
  
  // Method 3: Clear cookies from page
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  });
}

// Check if we're on Roblox
if (window.location.hostname.includes('roblox.com')) {
  console.log("Hayop Ka Ah: On Roblox site");
  
  // Listen for messages from background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "logoutFromPage") {
      forceRobloxLogout();
      sendResponse({ success: true });
    }
    return true;
  });
}
