import { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (!transcript) return;

    const index = transcript.findIndex((segment, i) => {
      const nextSegment = transcript[i + 1];
      return currentTime >= segment.start && (!nextSegment || currentTime < nextSegment.start);
    });

    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [currentTime, transcript]);

  if (!transcript) {
    return <div className="text-gray-500 p-4">No transcript available</div>;
  }

  const currentSegment = transcript[activeIndex];
  const previousSegment = activeIndex > 0 ? transcript[activeIndex - 1] : null;

  return (
    <div className="h-full p-4">
      {previousSegment && (
        <div className="text-sm text-gray-500 opacity-60 transition-opacity duration-300">
          <div className="flex items-start gap-2">
            <span className="font-mono whitespace-nowrap">
              {formatTime(previousSegment.start)}
            </span>
            <span>{previousSegment.text}</span>
          </div>
        </div>
      )}

      {currentSegment && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-2 mt-2 transition-all duration-300">
          <div className="flex items-start gap-2">
            <span className="font-mono whitespace-nowrap text-gray-500">
              {formatTime(currentSegment.start)}
            </span>
            <span className="font-medium">
              {currentSegment.text}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 