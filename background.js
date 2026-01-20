// Main background service worker
console.log("Hayop Ka Ah extension installed/updated");

// Clear Roblox cookies and session on installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("Extension installed:", details.reason);
  
  if (details.reason === "install" || details.reason === "update") {
    await logoutRoblox();
    
    // Notify user
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Hayop Ka Ah - Roblox Logout",
      message: "All Roblox sessions have been logged out for security."
    });
    
    // Open Roblox to show logged out state
    setTimeout(() => {
      chrome.tabs.create({ url: "https://www.roblox.com" });
    }, 1000);
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
      console.log(`Found ${cookies.length} Roblox cookies to remove`);
      
      cookies.forEach(cookie => {
        const url = `https://${cookie.domain.startsWith(".") ? "" : ""}${cookie.domain}${cookie.path}`;
        chrome.cookies.remove({
          url: url,
          name: cookie.name
        }, () => {
          if (chrome.runtime.lastError) {
            console.warn(`Failed to remove ${cookie.name}:`, chrome.runtime.lastError);
          }
        });
      });
      
      // Clear local storage data
      chrome.tabs.query({ url: "*://*.roblox.com/*" }, (tabs) => {
        tabs.forEach(tab => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              localStorage.clear();
              sessionStorage.clear();
            }
          });
        });
      });
      
      console.log("Roblox logout completed");
      resolve();
    });
  });
}

// Auto-logout when Roblox tab is opened (optional)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.includes("roblox.com")) {
    // Check if we should auto-logout
    chrome.storage.local.get(["autoLogout"], (result) => {
      if (result.autoLogout !== false) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"]
        });
      }
    });
  }
});