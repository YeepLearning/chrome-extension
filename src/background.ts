// We can't use ES modules in service workers, so we'll use a different logging approach
function log(event: string, data: Record<string, any>) {
    console.log(`[Background] ${event}:`, data);
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'CAPTURE_SCREENSHOT') {
        // Get the current tab ID from the sender
        const tabId = sender.tab?.id;
        if (!tabId) {
            sendResponse({ error: 'No tab ID found' });
            return true;
        }

        // Get the current window and capture screenshot
        chrome.windows.getCurrent()
            .then(window => {
                if (!window.id) {
                    throw new Error('No window ID found');
                }
                return chrome.tabs.captureVisibleTab(window.id, { format: 'png' });
            })
            .then(dataUrl => {
                log('screenshot_captured', {
                    tabId,
                    timestamp: Date.now()
                });
                sendResponse({ screenshot: dataUrl });
            })
            .catch(error => {
                log('screenshot_error', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    tabId
                });
                sendResponse({ error: 'Failed to capture screenshot' });
            });

        return true; // Required for async response
    }
}); 