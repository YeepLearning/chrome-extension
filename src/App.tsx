import { useState, useEffect } from 'react';
import { Navigation, type Tab } from '@/components/Navigation';
import { HomeTab } from '@/components/HomeTab';
import { ChatTab } from '@/components/ChatTab';
import { DebugTab } from '@/components/DebugTab';
import { buildSystemMessage } from '@/utils/chat';
import { useChat } from 'ai/react';
import type { Message } from 'ai';
import { Sun, Moon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [screenshot, setScreenshot] = useState<string>();
  const [events, setEvents] = useState<Array<{ type: string; timestamp: string; data?: any }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Effect to handle system dark mode changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Effect to apply dark mode class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const { messages, setInput, isLoading: isChatLoading, setMessages } = useChat({
    api: process.env.NODE_ENV === 'production'
      ? 'http://localhost:3000/api/chat'
      : 'http://localhost:3000/api/chat',
    initialInput: extractedContent ? buildSystemMessage(extractedContent) : '',
  });

  // Handle sending a new message
  const handleSendMessage = (message: string) => {
    // Set the input which will trigger the useChat hook to send the message
    setInput(message);

    // Log the event
    setEvents(prev => [...prev, {
      type: 'CHAT_MESSAGE_SENT',
      timestamp: new Date().toISOString(),
      data: { message }
    }]);
  };

  // Effect to load content
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
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_CONTENT' });
            if (response.content) {
              setExtractedContent(response.content.mainContent || '');
              setScreenshot(response.content.screenshot);
              // Log the event
              setEvents(prev => [...prev, {
                type: 'CONTENT_LOADED',
                timestamp: new Date().toISOString(),
                data: { url: tab.url }
              }]);
            }
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
        // Log the error event
        setEvents(prev => [...prev, {
          type: 'ERROR',
          timestamp: new Date().toISOString(),
          data: { error: error instanceof Error ? error.message : 'Unknown error' }
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  // Convert chat messages to our format
  const chatMessages = messages.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: new Date().toLocaleTimeString()
  }));

  if (isLoading) {
    return (
      <div className="w-[400px] h-[600px] flex items-center justify-center bg-background dark:bg-background-dark text-secondary transition-colors">
        {error ? error : 'Loading content...'}
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[600px] flex flex-col bg-background dark:bg-background-dark text-secondary transition-colors">
      {/* Header with dark mode toggle */}
      <header className="px-4 py-2 flex justify-end border-b border-primary-light/20 dark:border-primary-dark/20">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg hover:bg-surface dark:hover:bg-surface-dark transition-colors"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-primary" />
          ) : (
            <Moon className="w-5 h-5 text-primary" />
          )}
        </button>
      </header>

      {/* Main content area with padding for navigation */}
      <main className="flex-1 overflow-hidden pb-16">
        {activeTab === 'home' && (
          <HomeTab
            recentItems={[
              {
                title: 'Current Page',
                timestamp: new Date().toLocaleTimeString(),
                url: window.location.href,
                type: 'website'
              }
            ]}
          />
        )}
        {activeTab === 'chat' && (
          <ChatTab
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
          />
        )}
        {activeTab === 'debug' && (
          <DebugTab
            extractedContent={extractedContent}
            screenshot={screenshot}
            events={events}
          />
        )}
      </main>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
