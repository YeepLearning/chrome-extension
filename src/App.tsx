import { useEffect, useState } from 'react';
import { TranscriptViewer } from '@/components/TranscriptViewer';
import { buildSystemMessage } from '@/utils/chat';
import { useChat } from 'ai/react';
import type { TranscriptSegment } from './content-scripts/youtube/youtube';
import type { LeetCodeContent } from './content-scripts/leetcode/leetcode';
import type { PageContent } from './content-scripts/default/default';

type Content = TranscriptSegment[] | LeetCodeContent | PageContent | null;

// locally, build returns this
const PRODUCTION_URL = 'http://localhost:3000/api/chat';
const DEVELOPMENT_URL = 'http://localhost:3000/api/chat';
const CHAT_API = process.env.NODE_ENV === 'production'
  ? PRODUCTION_URL
  : DEVELOPMENT_URL;

export default function App() {
  const [content, setContent] = useState<Content>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: CHAT_API,
    initialInput: content ? buildSystemMessage(content) : '',
  });

  // Effect to update system message when content changes
  useEffect(() => {
    if (!content) return;

    setMessages(messages => {
      const systemMessage = { id: 'system', role: 'assistant', content: buildSystemMessage(content) };
      const userMessages = messages.filter(m => m.role === 'user' || m.id !== 'system');
      return [systemMessage, ...userMessages];
    });
  }, [content, setMessages]);

  // Separate effect for content loading
  useEffect(() => {
    const loadContent = async () => {
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
            // Determine which action to use based on the URL
            const action = tab.url?.includes('youtube.com') ? 'GET_TRANSCRIPT' : 'GET_CONTENT';
            const response = await chrome.tabs.sendMessage(tab.id, { action });
            console.log('response', response);
            setContent(response.content);
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

    loadContent();
  }, []);

  // Separate effect for time updates (only for YouTube)
  useEffect(() => {
    if (!content || !Array.isArray(content)) return; // Only run for YouTube content

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
  }, [content]);

  if (isLoading) {
    return (
      <div className="w-[400px] h-[400px] flex items-center justify-center bg-white text-gray-500">
        {error ? error : 'Loading content...'}
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[600px] flex flex-col bg-white text-gray-900">
      {/* Current time display - only for YouTube */}
      {Array.isArray(content) && (
        <div className="sticky top-0 p-2 text-sm font-mono text-gray-500 border-b bg-white">
          {formatTime(currentTime)}
        </div>
      )}

      {/* Content viewer - make it scrollable */}
      <div className="flex-1 overflow-y-auto">
        {Array.isArray(content) ? (
          <TranscriptViewer
            transcript={content}
            currentTime={currentTime}
          />
        ) : content ? (
          <div className="p-4">
            {'problemDescription' in content ? (
              // LeetCode content
              <>
                <h2 className="text-lg font-bold mb-4">Problem Description</h2>
                <div className="whitespace-pre-wrap mb-4">{content.problemDescription}</div>
                <h2 className="text-lg font-bold mb-4">Your Solution</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  <code>{content.userSolution}</code>
                </pre>
              </>
            ) : (
              // Default content
              <>
                <h1 className="text-xl font-bold mb-4">{content.title}</h1>
                <div className="whitespace-pre-wrap">{content.mainContent}</div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Chat messages */}
      <div className="border-t bg-gray-50 p-2 h-[200px] overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-2 p-2 rounded ${m.role === 'user' ? 'bg-blue-100' : 'bg-green-100'
              }`}
          >
            <div className="font-bold">{m.role === 'user' ? 'You' : 'Assistant'}:</div>
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
          placeholder="Ask a question about the content..."
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
