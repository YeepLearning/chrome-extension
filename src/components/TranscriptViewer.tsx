import { useEffect, useRef, useState } from 'react';

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface Props {
  transcript: TranscriptSegment[] | null;
  currentTime: number;
}

export function TranscriptViewer({ transcript, currentTime }: Props) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!transcript) return;
    
    // Find current segment
    const index = transcript.findIndex((segment, i) => {
      const nextSegment = transcript[i + 1];
      return currentTime >= segment.start && (!nextSegment || currentTime < nextSegment.start);
    });
    
    if (index !== -1) {
      setActiveIndex(index);
      activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, transcript]);

  if (!transcript) {
    return <div className="text-gray-500 p-4">No transcript available</div>;
  }

  return (
    <div className="h-full">
      {transcript.map((segment, index) => {
        const isActive = index === activeIndex;
        const isPrevious = index === activeIndex - 1;

        return (
          <div
            key={segment.start}
            ref={isActive ? activeRef : null}
            className={`p-2 transition-all duration-300 ${
              isActive 
                ? 'bg-blue-50 border-l-4 border-blue-500' 
                : isPrevious 
                  ? 'opacity-60' 
                  : 'opacity-30'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm text-gray-500 font-mono whitespace-nowrap">
                {formatTime(segment.start)}
              </span>
              <span className="font-medium">
                {segment.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 