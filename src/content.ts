import { log } from '@/utils/logger'
import * as youtube from './content-scripts/youtube/youtube'
import * as leetcode from './content-scripts/leetcode/leetcode'
import * as defaultHandler from './content-scripts/default/default'

function getSiteHandler() {
  const url = window.location.href;

  if (url.includes('youtube.com')) {
    return youtube;
  } else if (url.includes('leetcode.com')) {
    return leetcode;
  } else {
    return defaultHandler;
  }
}

// Log content script load
log('content_script_loaded', {
  url: window.location.href,
  timestamp: Date.now()
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  const handler = getSiteHandler();

  if (request.action === 'GET_TRANSCRIPT' || request.action === 'GET_CONTENT') {
    log('content_request_received', {
      url: window.location.href,
      timestamp: Date.now()
    });

    // Call the appropriate handler's getTranscript or getContent method
    const getContentPromise = 'getTranscript' in handler
      ? (handler as typeof youtube).getTranscript()
      : (handler as typeof leetcode | typeof defaultHandler).getContent();

    getContentPromise.then(content => {
      if (content) {
        log('content_response_sent', {
          url: window.location.href,
          timestamp: Date.now(),
          success: true
        });
      } else {
        log('content_response_sent', {
          url: window.location.href,
          timestamp: Date.now(),
          success: false,
          error: 'No content found'
        });
      }
      sendResponse({ content });
    });
    return true; // Required for async response
  } else if (request.action === 'GET_CURRENT_TIME' && 'getCurrentTime' in handler) {
    const currentTime = (handler as typeof youtube).getCurrentTime();
    sendResponse({ currentTime });
  }
}); 