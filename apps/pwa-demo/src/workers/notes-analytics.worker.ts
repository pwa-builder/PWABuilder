/// <reference lib="webworker" />
// Computes text analytics off the main thread so typing stays smooth even for
// very large notes.

export interface AnalyticsResult {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingSeconds: number;
  topWords: Array<{ word: string; count: number }>;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'of', 'to', 'in', 'on', 'for',
  'is', 'are', 'was', 'were', 'be', 'been', 'it', 'this', 'that', 'with', 'as',
  'at', 'by', 'from', 'i', 'you', 'he', 'she', 'they', 'we', 'my', 'your',
]);

function analyze(text: string): AnalyticsResult {
  const trimmed = text.trim();
  const wordList = trimmed ? trimmed.split(/\s+/) : [];
  const words = wordList.length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = (trimmed.match(/[.!?]+(\s|$)/g) || []).length || (trimmed ? 1 : 0);
  const paragraphs = trimmed ? trimmed.split(/\n{2,}/).filter(Boolean).length : 0;
  // Average adult reading speed ~200 wpm.
  const readingSeconds = Math.round((words / 200) * 60);

  const freq = new Map<string, number>();
  for (const raw of wordList) {
    const w = raw.toLowerCase().replace(/[^a-z0-9']/g, '');
    if (w.length < 3 || STOP_WORDS.has(w)) {
      continue;
    }
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  const topWords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word, count]) => ({ word, count }));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingSeconds,
    topWords,
  };
}

self.addEventListener('message', (event: MessageEvent<{ id: number; text: string }>) => {
  const { id, text } = event.data;
  const result = analyze(text);
  (self as unknown as Worker).postMessage({ id, result });
});
