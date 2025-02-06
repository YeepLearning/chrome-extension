import { useEffect, useState } from 'react';
import { TranscriptViewer } from '@/components/TranscriptViewer';
import { buildSystemMessage } from '@/utils/chat';
import { useChat } from 'ai/react';

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

// locally, build returns this
const PRODUCTION_URL = 'http://localhost:3000/api/chat';
const DEVELOPMENT_URL = 'http://localhost:3000/api/chat';
const CHAT_API = process.env.NODE_ENV === 'production'
  ? PRODUCTION_URL
  : DEVELOPMENT_URL;

export default function App() {
  const [transcript, setTranscript] = useState<TranscriptSegment[] | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: CHAT_API,
    initialInput: transcript ? buildSystemMessage(transcript) : '',
  });

  // Effect to update system message when transcript changes
  useEffect(() => {
    if (!transcript) return;

    setMessages(messages => {
      const systemMessage = { id: 'system', role: 'assistant', content: buildSystemMessage(transcript) };
      const userMessages = messages.filter(m => m.role === 'user' || m.id !== 'system');
      return [systemMessage, ...userMessages];
    });
  }, [transcript, setMessages]);

  // Separate effect for transcript loading
  useEffect(() => {
    const loadTranscript = async () => {
      try {
        setIsLoading(true);
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.id) {
          throw new Error('No active tab found');
        }

        // Add retry logic for content script connection
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
          try {
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_TRANSCRIPT' });
            console.log('response', response);
            setTranscript(response.transcript);
            break;
          } catch (error) {
            retries++;
            if (retries === maxRetries) {
              throw new Error('Could not connect to page. Please refresh the page and try again.');
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
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
        {error ? error : 'Loading transcript...'}
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

      {/* Chat messages */}
      <div className="border-t bg-gray-50 p-2 h-[200px] overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-2 p-2 rounded ${m.role === 'user' ? 'bg-blue-100' : 'bg-green-100'
              }`}
          >
            <div className="font-bold">{m.role === 'user' ? 'You' : 'Lion King'}:</div>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
      </div>

      {/* Question input - keep it fixed at bottom */}
      <form onSubmit={handleSubmit} className="sticky bottom-0 p-2 border-t bg-white">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question about the video..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
