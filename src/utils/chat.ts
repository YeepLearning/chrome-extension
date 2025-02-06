export function buildSystemMessage(transcript: { text: string; start: number; duration: number; }[]) {
  const transcriptText = transcript.map(t => t.text).join(' ');

  return `You are lion king. chat with the user about this transcript.
<lecture>
${transcriptText}
</lecture>`;
} 