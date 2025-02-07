import { Send } from 'lucide-react';
import { useState } from 'react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface ChatTabProps {
    messages?: Message[];
    onSendMessage?: (message: string) => void;
    isLoading?: boolean;
}

export function ChatTab({ messages = [], onSendMessage, isLoading = false }: ChatTabProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && onSendMessage) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'
                            }`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${message.role === 'user'
                                ? 'bg-primary text-white dark:bg-primary-dark'
                                : 'bg-surface dark:bg-surface-dark text-secondary dark:text-secondary-light border border-primary-light/20 dark:border-primary-dark/20'
                                }`}
                        >
                            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                            <div className={`text-xs mt-1 ${message.role === 'user'
                                    ? 'text-white/70'
                                    : 'text-secondary/70 dark:text-secondary-light/70'
                                }`}>
                                {message.timestamp}
                            </div>
                        </div>
                    </div>
                ))}
                {messages.length === 0 && (
                    <div className="text-center text-secondary dark:text-secondary-light text-sm py-8">
                        No messages yet. Start a conversation!
                    </div>
                )}
                {isLoading && (
                    <div className="flex justify-center">
                        <div className="bg-surface dark:bg-surface-dark text-secondary dark:text-secondary-light text-sm px-4 py-2 rounded-full shadow-sm">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="border-t border-primary-light/20 dark:border-primary-dark/20 p-4 bg-surface dark:bg-surface-dark transition-colors"
            >
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="flex-1 bg-background dark:bg-background-dark rounded-xl px-4 py-2.5 
              text-secondary dark:text-secondary-light placeholder:text-secondary/50 dark:placeholder:text-secondary-light/50
              border border-primary-light/20 dark:border-primary-dark/20 
              focus:outline-none focus:border-primary/30 dark:focus:border-primary-light/30
              transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2.5 rounded-xl bg-primary dark:bg-primary-dark text-white 
              disabled:opacity-50 disabled:cursor-not-allowed 
              hover:bg-primary-dark dark:hover:bg-primary 
              transition-colors shadow-sm"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
} 