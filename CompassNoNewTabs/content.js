(function() {
    'use strict';
    
    let isEnabled = true;
    let observer = null;
    let originalTargets = new Map(); // Store original target values for restoration
    
    // Check if extension is enabled
    async function checkEnabled() {
        try {
            const result = await chrome.storage.sync.get(['enabled']);
            isEnabled = result.enabled !== false; // Default to true
        } catch (error) {
            console.log('Storage not available, defaulting to enabled');
            isEnabled = true;
        }
    }
    
    function shouldPreserveLink(link) {
        // Check if this is the Outlook link we want to keep opening in new tab
        if (link.href === "https://outlook.office.com/owa/?realm=education.wa.edu.au") {
            return true;
        }
        
        // Check if this link is under the "School Favourites" menu
        const parentLi = link.closest('li.clickable');
        if (parentLi) {
            const menuHeader = parentLi.querySelector('.mnuHead');
            if (menuHeader && menuHeader.textContent.trim() === 'School Favourites') {
                return true;
            }
        }
        
        return false;
    }
    
    function removeTargetBlank() {
        if (!isEnabled) return;
        
        // Find all links with target="_blank"
        const links = document.querySelectorAll('a[target="_blank"]');
        
        links.forEach(link => {
            if (shouldPreserveLink(link)) {
                console.log('Keeping target="_blank" for preserved link:', link.href);
                return;
            }
            
            // Store original target before removing (for potential restoration)
            if (!originalTargets.has(link)) {
                originalTargets.set(link, link.getAttribute('target'));
            }
            
            // Remove the target attribute
            link.removeAttribute('target');
            console.log('Removed target="_blank" from:', link.href);
        });
    }
    
    function restoreTargetBlank() {
        // Find all links and restore their original target="_blank" if they had it
        const allLinks = document.querySelectorAll('a');
        
        allLinks.forEach(link => {
            if (originalTargets.has(link) && !shouldPreserveLink(link)) {
                const originalTarget = originalTargets.get(link);
                if (originalTarget) {
                    link.setAttribute('target', originalTarget);
                    console.log('Restored target="_blank" to:', link.href);
                }
            }
        });
        
        // Also check for any links that currently don't have target="_blank" but should
        const linksWithoutTarget = document.querySelectorAll('a:not([target])');
        linksWithoutTarget.forEach(link => {
            if (!shouldPreserveLink(link)) {
                // Check if this link would typically have target="_blank" by looking at similar links
                const similarLinks = document.querySelectorAll(`a[href="${link.href}"][target="_blank"]`);
                if (similarLinks.length > 0) {
                    link.setAttribute('target', '_blank');
                    originalTargets.set(link, '_blank');
                    console.log('Restored target="_blank" to:', link.href);
                }
            }
        });
    }
    
    function processAllLinks() {
        if (isEnabled) {
            removeTargetBlank();
        } else {
            restoreTargetBlank();
        }
    }
    
    function startObserver() {
        if (observer) return; // Already observing
        
        observer = new MutationObserver(function(mutations) {
            let shouldCheck = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any added nodes contain links
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'A' || node.querySelector('a')) {
                                shouldCheck = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldCheck) {
                processAllLinks();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }
    
    // Listen for storage changes (when popup toggles the setting)
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.enabled) {
            const wasEnabled = isEnabled;
            isEnabled = changes.enabled.newValue;
            
            // Process all links immediately when state changes
            processAllLinks();
            
            if (isEnabled && !wasEnabled) {
                startObserver();
                console.log('Extension enabled - target="_blank" removal active');
            } else if (!isEnabled && wasEnabled) {
                console.log('Extension disabled - target="_blank" attributes restored');
            }
        }
    });
    
    // Initialize
    async function init() {
        await checkEnabled();
        processAllLinks();
        startObserver(); // Always start observer, it will check isEnabled internally
        console.log('Target blank remover extension loaded -', isEnabled ? 'enabled' : 'disabled');
    }
    
    init();
})();