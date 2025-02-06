import { useEffect, useState } from 'react';

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export function TranscriptViewer() {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSegment, setCurrentSegment] = useState<TranscriptSegment | null>(null);

  useEffect(() => {
    // Get initial transcript
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'GET_TRANSCRIPT' }, (response) => {
          if (response?.transcript) {
            setTranscript(response.transcript);
          }
        });
      }
    });

    // Set up interval to update current time
    const interval = setInterval(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: 'GET_CURRENT_TIME' }, (response) => {
            if (response?.currentTime) {
              setCurrentTime(response.currentTime);
            }
          });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update current segment based on time
  useEffect(() => {
    const currentSegment = transcript.find((segment, index) => {
      const nextSegment = transcript[index + 1];
      return currentTime >= segment.start && 
             (!nextSegment || currentTime < nextSegment.start);
    });
    setCurrentSegment(currentSegment || null);
  }, [currentTime, transcript]);

  if (!transcript.length) {
    return <div className="p-4">No transcript available</div>;
  }

  return (
    <div className="w-[400px] h-[600px] p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Current Transcript</h2>
      {currentSegment && (
        <div className="bg-yellow-100 p-4 rounded-lg mb-4">
          {currentSegment.text}
        </div>
      )}
      <div className="space-y-2">
        {transcript.map((segment, index) => (
          <div 
            key={index}
            className={`p-2 rounded ${
              currentSegment === segment ? 'bg-yellow-100' : ''
            }`}
          >
            <span className="text-gray-500">
              {formatTime(segment.start)}
            </span>
            <span className="ml-2">{segment.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 