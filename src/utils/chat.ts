import type { TranscriptSegment } from '@/content-scripts/youtube/youtube';
import type { LeetCodeContent } from '@/content-scripts/leetcode/leetcode';
import type { PageContent } from '@/content-scripts/default/default';

type Content = TranscriptSegment[] | LeetCodeContent | PageContent;

export function buildSystemMessage(content: Content): string {
  if (Array.isArray(content)) {
    // YouTube transcript
    return `This is a transcript of a video. Each segment has text, start time, and duration. Here's the transcript:

${content.map(segment => `[${formatTime(segment.start)}] ${segment.text}`).join('\n')}

Please help me understand this video content.`;
  } else if ('problemDescription' in content) {
    // LeetCode content
    return `This is a LeetCode problem. Here's the problem description and solution:

Problem Description:
${content.problemDescription}

Your Solution:
${content.userSolution}

Please help me understand this problem and solution.`;
  } else {
    // Default content
    return `This is the content from the webpage:

Title: ${content.title}

Content:
${content.mainContent}

Please help me understand this content.`;
  }
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 