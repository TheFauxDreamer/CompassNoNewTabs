document.addEventListener('DOMContentLoaded', async () => {
    // Use browser API if available, fallback to chrome API
    const storageAPI = (typeof browser !== 'undefined') ? browser.storage : chrome.storage;
    
    const statusDiv = document.getElementById('status');
    const toggleBtn = document.getElementById('toggleBtn');
    
    // Get current state
    const result = await storageAPI.sync.get(['enabled']);
    const isEnabled = result.enabled !== false; // Default to true
    
    function updateUI(enabled) {
        if (enabled) {
            statusDiv.textContent = 'Extension is ENABLED';
            statusDiv.className = 'status enabled';
            toggleBtn.textContent = 'Disable Me';
            toggleBtn.className = 'toggle-btn disable';
        } else {
            statusDiv.textContent = 'Extension is DISABLED';
            statusDiv.className = 'status disabled';
            toggleBtn.textContent = 'Enable Me';
            toggleBtn.className = 'toggle-btn enable';
        }
    }
    
    // Initial UI update
    updateUI(isEnabled);
    
    // Toggle functionality
    toggleBtn.addEventListener('click', async () => {
        const currentResult = await storageAPI.sync.get(['enabled']);
        const currentEnabled = currentResult.enabled !== false;
        const newEnabled = !currentEnabled;
        
        await storageAPI.sync.set({ enabled: newEnabled });
        updateUI(newEnabled);
    });
});