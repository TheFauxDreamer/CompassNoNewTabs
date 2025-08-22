document.addEventListener('DOMContentLoaded', async () => {
    const statusDiv = document.getElementById('status');
    const toggleBtn = document.getElementById('toggleBtn');
    
    // Get current state
    const result = await chrome.storage.sync.get(['enabled']);
    const isEnabled = result.enabled !== false; // Default to true
    
    function updateUI(enabled) {
        if (enabled) {
            statusDiv.textContent = 'Extension is ENABLED';
            statusDiv.className = 'status enabled';
            toggleBtn.textContent = 'Disable';
            toggleBtn.className = 'toggle-btn disable';
        } else {
            statusDiv.textContent = 'Extension is DISABLED';
            statusDiv.className = 'status disabled';
            toggleBtn.textContent = 'Enable';
            toggleBtn.className = 'toggle-btn enable';
        }
    }
    
    // Initial UI update
    updateUI(isEnabled);
    
    // Toggle functionality
    toggleBtn.addEventListener('click', async () => {
        const currentResult = await chrome.storage.sync.get(['enabled']);
        const currentEnabled = currentResult.enabled !== false;
        const newEnabled = !currentEnabled;
        
        await chrome.storage.sync.set({ enabled: newEnabled });
        updateUI(newEnabled);
    });
});