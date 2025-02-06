interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

const SELECTORS = {
  MORE_BUTTON: 'ytd-video-description-transcript-section-renderer button',
  SHOW_TRANSCRIPT_BUTTON: 'ytd-button-renderer[button-renderer] button',
  TRANSCRIPT_PANEL: 'ytd-transcript-renderer',
  TRANSCRIPT_SEGMENTS: 'ytd-transcript-segment-renderer'
};

async function waitForElement(selector: string, timeout = 5000): Promise<Element | null> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return null;
}

async function getYouTubeTranscript(): Promise<TranscriptSegment[] | null> {
  // Click "More" button
  const moreButton = await waitForElement(SELECTORS.MORE_BUTTON);
  if (!moreButton) {
    console.log('Could not find More button');
    return null;
  }
  (moreButton as HTMLButtonElement).click();

  // Wait for and click "Show transcript" button
  const showTranscriptButton = await waitForElement(SELECTORS.SHOW_TRANSCRIPT_BUTTON);
  if (!showTranscriptButton) {
    console.log('Could not find Show transcript button');
    return null;
  }
  (showTranscriptButton as HTMLButtonElement).click();

  // Wait for transcript panel
  const transcriptPanel = await waitForElement(SELECTORS.TRANSCRIPT_PANEL);
  if (!transcriptPanel) {
    console.log('Could not find transcript panel');
    return null;
  }

  // Wait for transcript segments to load
  const segments = await waitForElement(SELECTORS.TRANSCRIPT_SEGMENTS);
  if (!segments) {
    console.log('Could not find transcript segments');
    return null;
  }

  // Extract transcript segments
  const transcriptSegments = document.querySelectorAll(SELECTORS.TRANSCRIPT_SEGMENTS);
  const transcript = Array.from(transcriptSegments).map((segment, index, array) => {
    const text = segment.querySelector('.segment-text')?.textContent || '';
    const timestamp = segment.querySelector('.segment-timestamp')?.textContent || '';
    const start = parseTimestamp(timestamp);

    // Calculate duration based on next segment's start time
    const nextSegment = array[index + 1];
    const nextStart = nextSegment
      ? parseTimestamp(nextSegment.querySelector('.segment-timestamp')?.textContent || '')
      : start + 5; // Assume 5 seconds for last segment

    return {
      text,
      start,
      duration: nextStart - start
    };
  });

  return transcript;
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

// Function to get current video time
function getCurrentVideoTime(): number {
  const video = document.querySelector('video');
  return video ? video.currentTime : 0;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'GET_TRANSCRIPT') {
    // Since getYouTubeTranscript is now async, we need to handle it differently
    getYouTubeTranscript().then(transcript => {
      sendResponse({ transcript });
    });
    return true; // Required for async response
  } else if (request.action === 'GET_CURRENT_TIME') {
    sendResponse({ currentTime: getCurrentVideoTime() });
  }
}); 