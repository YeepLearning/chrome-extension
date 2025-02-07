import { Home, MessageSquare, Bug } from 'lucide-react';

export type Tab = 'home' | 'chat' | 'debug';

interface NavigationProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
    const tabs = [
        { id: 'home' as const, icon: Home, label: 'Home' },
        { id: 'chat' as const, icon: MessageSquare, label: 'Chat' },
        { id: 'debug' as const, icon: Bug, label: 'Debug' },
    ];

    return (
        <nav className="absolute bottom-0 left-0 right-0 bg-surface dark:bg-surface-dark border-t border-primary-light/20 dark:border-primary-dark/20 transition-colors">
            <div className="flex justify-around items-center px-4 py-2">
                {tabs.map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => onTabChange(id)}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors
              ${activeTab === id
                                ? 'text-primary bg-surface-secondary dark:bg-surface-dark-secondary'
                                : 'text-secondary hover:text-primary-dark dark:text-secondary-light dark:hover:text-primary-light'
                            }`}
                    >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs mt-1">{label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
} 