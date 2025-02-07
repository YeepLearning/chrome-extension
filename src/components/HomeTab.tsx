import { Clock, Star } from 'lucide-react';

interface RecentItem {
    title: string;
    timestamp: string;
    url: string;
    type: 'note' | 'website';
}

interface HomeTabProps {
    recentItems?: RecentItem[];
}

export function HomeTab({ recentItems = [] }: HomeTabProps) {
    return (
        <div className="p-4 bg-background min-h-full">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="font-display text-2xl text-primary mb-2">Welcome to Aura</h1>
                <p className="text-secondary text-sm">Your AI-powered research companion</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button className="p-4 bg-surface rounded-lg border border-primary-light/20 hover:bg-surface-secondary transition-colors">
                    <Star className="w-5 h-5 text-primary mb-2" />
                    <span className="text-sm font-medium text-secondary">New Note</span>
                </button>
                <button className="p-4 bg-surface rounded-lg border border-primary-light/20 hover:bg-surface-secondary transition-colors">
                    <Clock className="w-5 h-5 text-primary mb-2" />
                    <span className="text-sm font-medium text-secondary">Recent</span>
                </button>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-lg font-medium text-secondary mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {recentItems.map((item, index) => (
                        <div
                            key={index}
                            className="p-3 bg-surface rounded-lg border border-primary-light/20"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-primary-dark truncate">
                                    {item.title}
                                </span>
                                <span className="text-xs text-secondary">
                                    {item.timestamp}
                                </span>
                            </div>
                            <div className="text-xs text-secondary truncate">
                                {item.url}
                            </div>
                        </div>
                    ))}
                    {recentItems.length === 0 && (
                        <div className="text-center text-secondary text-sm py-8">
                            No recent activity yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 