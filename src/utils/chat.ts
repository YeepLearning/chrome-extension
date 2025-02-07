import type { TranscriptSegment } from '@/content-scripts/youtube/youtube';
import type { LeetCodeContent } from '@/content-scripts/leetcode/leetcode';
import type { PageContent } from '@/content-scripts/default/default';

type Content = TranscriptSegment[] | LeetCodeContent | PageContent;

export function buildSystemMessage(content: string): string {
  return `You are a helpful AI assistant. Here is the content from the current page:

${content}

Please help answer any questions about this content.`;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 