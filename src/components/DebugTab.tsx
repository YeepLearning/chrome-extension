import { ChevronDown, ChevronRight, FileText, Image, Activity } from 'lucide-react';
import { useState } from 'react';

interface CollapsibleSectionProps {
    title: string;
    icon: typeof FileText;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-primary-light/20 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center p-3 bg-surface text-secondary hover:text-primary transition-colors"
            >
                <Icon className="w-5 h-5 mr-2" />
                <span className="flex-1 text-left font-medium">{title}</span>
                {isOpen ? (
                    <ChevronDown className="w-5 h-5" />
                ) : (
                    <ChevronRight className="w-5 h-5" />
                )}
            </button>
            {isOpen && (
                <div className="p-3 bg-background border-t border-primary-light/20">
                    {children}
                </div>
            )}
        </div>
    );
}

interface DebugTabProps {
    extractedContent?: string;
    screenshot?: string;
    events?: Array<{
        type: string;
        timestamp: string;
        data?: any;
    }>;
}

export function DebugTab({ extractedContent, screenshot, events = [] }: DebugTabProps) {
    return (
        <div className="p-4 space-y-4 bg-background min-h-full">
            <CollapsibleSection title="Extracted Content" icon={FileText} defaultOpen>
                {extractedContent ? (
                    <pre className="whitespace-pre-wrap text-sm text-secondary font-mono bg-surface p-3 rounded">
                        {extractedContent}
                    </pre>
                ) : (
                    <div className="text-secondary text-sm">No content extracted yet</div>
                )}
            </CollapsibleSection>

            <CollapsibleSection title="Screenshot" icon={Image}>
                {screenshot ? (
                    <div className="rounded overflow-hidden">
                        <img src={screenshot} alt="Page screenshot" className="w-full" />
                    </div>
                ) : (
                    <div className="text-secondary text-sm">No screenshot available</div>
                )}
            </CollapsibleSection>

            <CollapsibleSection title="Events" icon={Activity}>
                <div className="space-y-2">
                    {events.map((event, index) => (
                        <div
                            key={index}
                            className="text-sm bg-surface p-2 rounded"
                        >
                            <div className="flex justify-between text-secondary mb-1">
                                <span className="font-medium">{event.type}</span>
                                <span className="text-xs">{event.timestamp}</span>
                            </div>
                            {event.data && (
                                <pre className="text-xs text-secondary-dark overflow-x-auto">
                                    {JSON.stringify(event.data, null, 2)}
                                </pre>
                            )}
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="text-secondary text-sm">No events logged</div>
                    )}
                </div>
            </CollapsibleSection>
        </div>
    );
} 