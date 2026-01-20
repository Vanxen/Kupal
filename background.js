// Main background service worker - SILENT VERSION
console.log("Hayop Ka Ah extension installed/updated");

// Clear Roblox cookies and session on installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("Extension installed:", details.reason);
  
  if (details.reason === "install" || details.reason === "update") {
    await logoutRoblox();
    
    // NO NOTIFICATIONS - just open Roblox silently
    setTimeout(() => {
      chrome.tabs.create({ url: "https://www.roblox.com" });
    }, 500);
  }
});

// Listen for messages from popup or content scripts
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
    // Clear all Roblox-related cookies
    chrome.cookies.getAll({ domain: ".roblox.com" }, (cookies) => {
      console.log(`Removing ${cookies.length} Roblox cookies`);
      
      cookies.forEach(cookie => {
        const url = `https://${cookie.domain.startsWith(".") ? "" : ""}${cookie.domain}${cookie.path}`;
        chrome.cookies.remove({
          url: url,
          name: cookie.name
        });
      });
      
      // Clear storage on open Roblox tabs
      chrome.tabs.query({ url: "*://*.roblox.com/*" }, (tabs) => {
        tabs.forEach(tab => {
          if (chrome.tabs.executeScript) {
            chrome.tabs.executeScript(tab.id, {
              code: `try{localStorage.clear();sessionStorage.clear();}catch(e){}`
            });
          }
        });
      });
      
      console.log("Roblox logout completed");
      resolve();
    });
  });
}

// Optional: Auto-inject on Roblox pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.includes("roblox.com")) {
    if (chrome.tabs.executeScript) {
      chrome.tabs.executeScript(tabId, { file: "content.js" });
    }
  }
});
