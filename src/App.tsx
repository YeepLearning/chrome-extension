import { useEffect, useState } from 'react';
import { TranscriptViewer } from '@/components/TranscriptViewer';

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export default function App() {
  const [transcript, setTranscript] = useState<TranscriptSegment[] | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Separate effect for transcript loading
  useEffect(() => {
    const loadTranscript = async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0].id) return;

      try {
        const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'GET_TRANSCRIPT' });
        if (response?.transcript) {
          setTranscript(response.transcript);
        }
      } catch (error) {
        console.error('Failed to load transcript:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscript();
  }, []);

  // Separate effect for time updates
  useEffect(() => {
    if (!transcript) return; // Don't start polling until we have a transcript

    const updateTime = async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0].id) return;

      try {
        const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'GET_CURRENT_TIME' });
        if (response?.currentTime !== undefined) {
          setCurrentTime(response.currentTime);
        }
      } catch (error) {
        console.error('Failed to get current time:', error);
      }
    };

    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, [transcript]);

  if (isLoading) {
    return (
      <div className="w-[400px] h-[400px] flex items-center justify-center bg-white text-gray-500">
        Loading transcript...
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[600px] flex flex-col bg-white text-gray-900">
      {/* Current time display */}
      <div className="sticky top-0 p-2 text-sm font-mono text-gray-500 border-b bg-white">
        {formatTime(currentTime)}
      </div>

      {/* Transcript viewer - make it scrollable */}
      <div className="flex-1 overflow-y-auto">
        <TranscriptViewer
          transcript={transcript}
          currentTime={currentTime}
        />
      </div>

      {/* Question input - keep it fixed at bottom */}
      <div className="sticky bottom-0 p-2 border-t bg-white">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the video..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
