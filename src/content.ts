interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

// Function to extract transcript data from YouTube
function getYouTubeTranscript(): TranscriptSegment[] | null {
  const transcriptElements = document.querySelectorAll('ytd-transcript-segment-renderer');
  if (!transcriptElements.length) return null;

  return Array.from(transcriptElements).map(element => {
    const timestamp = element.querySelector('.segment-timestamp')?.textContent || '';
    const text = element.querySelector('.segment-text')?.textContent || '';
    const timeInSeconds = parseTimestamp(timestamp);

    return {
      text,
      start: timeInSeconds,
      duration: 0 // We'll calculate this based on the next segment
    };
  });
}

// Function to get current video time
function getCurrentVideoTime(): number {
  const video = document.querySelector('video');
  return video ? video.currentTime : 0;
}

// Helper function to parse YouTube timestamp
function parseTimestamp(timestamp: string): number {
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'GET_TRANSCRIPT') {
    sendResponse({ transcript: getYouTubeTranscript() });
  } else if (request.action === 'GET_CURRENT_TIME') {
    sendResponse({ currentTime: getCurrentVideoTime() });
  }
}); 