// Hayop Ka Ah - Roblox Auto Logout
// COMPLETE FIXED VERSION - NO ERRORS

console.log("Hayop Ka Ah extension loaded");

// Clear Roblox cookies and session on installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("Extension event:", details.reason);
  
  if (details.reason === "install" || details.reason === "update") {
    await logoutRoblox();
    
    // Open Roblox silently (updated to new URL)
    setTimeout(() => {
      chrome.tabs.create({ url: "https://roblox.com/home" });
    }, 300);
  }
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "logoutNow") {
    logoutRoblox().then(() => {
      sendResponse({ success: true });
    });
    return true;
  } else if (request.action === "getStatus") {
    chrome.cookies.getAll({ domain: ".roblox.com" }, (cookies) => {
      const isLoggedIn = cookies.some(cookie => 
        cookie.name.includes("ROBLOSECURITY") || 
        cookie.name.includes(".ROBLOSECURITY")
      );
      sendResponse({ loggedIn: isLoggedIn });
    });
    return true;
  }
});

// Function to logout from Roblox
async function logoutRoblox() {
  return new Promise((resolve) => {
    // Clear all Roblox cookies
    chrome.cookies.getAll({ domain: ".roblox.com" }, (cookies) => {
      if (cookies.length > 0) {
        cookies.forEach(cookie => {
          chrome.cookies.remove({
            url: `https://${cookie.domain}${cookie.path}`,
            name: cookie.name
          });
        });
        console.log(`Removed ${cookies.length} Roblox cookies`);
      }
      
      // SIMPLIFIED - No executeScript errors
      // Just clear cookies, that's enough for logout
      
      console.log("✅ Roblox logout completed");
      resolve();
    });
  });
}
