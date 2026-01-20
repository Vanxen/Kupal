// This can be injected into pages if needed
(function() {
  console.log('Hayop Ka Ah logout script injected');
  
  // Try to trigger Roblox logout via API
  if (typeof Roblox !== 'undefined') {
    try {
      // Attempt to clear any auth tokens
      localStorage.removeItem('RBXAuth');
      localStorage.removeItem('RBXSession');
      sessionStorage.clear();
      
      // Redirect to logout if still on Roblox
      if (window.location.hostname.includes('roblox.com') && 
          !window.location.pathname.includes('/logout')) {
        window.location.href = 'https://www.roblox.com/logout';
      }
    } catch (e) {
      console.warn('Logout script error:', e);
    }
  }
})();