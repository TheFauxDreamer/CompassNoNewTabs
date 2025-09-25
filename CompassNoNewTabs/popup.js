document.addEventListener('DOMContentLoaded', async () => {
    const statusDiv = document.getElementById('status');
    const toggleBtn = document.getElementById('toggleBtn');
    
    // Use browser API if available, fallback to chrome API for better Edge compatibility
    const api = typeof browser !== 'undefined' ? browser : chrome;
    
    // Get current state
    try {
        const result = await api.storage.sync.get(['enabled']);
        const isEnabled = result.enabled !== false; // Default to true
        
        function updateUI(enabled) {
            if (enabled) {
                statusDiv.textContent = 'CompassNoNewTabs is ACTIVE';
                statusDiv.className = 'status enabled';
                toggleBtn.textContent = 'Disable Me';
                toggleBtn.className = 'toggle-btn disable';
            } else {
                statusDiv.textContent = 'CompassNoNewTabs is INACTIVE';
                statusDiv.className = 'status disabled';
                toggleBtn.textContent = 'Enable Me';
                toggleBtn.className = 'toggle-btn enable';
            }
        }
        
        // Initial UI update
        updateUI(isEnabled);
        
        // Toggle functionality
        toggleBtn.addEventListener('click', async () => {
            try {
                const currentResult = await api.storage.sync.get(['enabled']);
                const currentEnabled = currentResult.enabled !== false;
                const newEnabled = !currentEnabled;
                
                await api.storage.sync.set({ enabled: newEnabled });
                updateUI(newEnabled);
            } catch (error) {
                console.error('Failed to toggle extension state:', error);
                statusDiv.textContent = 'Error occurred';
                statusDiv.className = 'status disabled';
            }
        });
        
    } catch (error) {
        console.error('Failed to load extension state:', error);
        statusDiv.textContent = 'Failed to load';
        statusDiv.className = 'status disabled';
        toggleBtn.textContent = 'Retry';
        toggleBtn.className = 'toggle-btn enable';
        
        // Allow retry on error
        toggleBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
});