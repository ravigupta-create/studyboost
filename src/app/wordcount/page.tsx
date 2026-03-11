'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'it', 'to', 'of', 'in', 'for', 'on',
  'with', 'at', 'by', 'and', 'or', 'but', 'not', 'this', 'that',
  'from', 'be', 'are', 'was', 'were', 'has', 'have', 'had',
  'will', 'would', 'can', 'could',
]);

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 2) return 1;
  // count vowel groups
  const matches = w.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 1;
  // subtract silent e at end
  if (w.endsWith('e') && count > 1) count--;
  return Math.max(count, 1);
}

interface StatCard {
  label: string;
  value: string | number;
}

export default function WordCountPage() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const words = text
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const wordCount = words.length;
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s/g, '').length;

    // Sentences: split by .!? followed by space or end
    const sentences = text
      .split(/[.!?]+(?:\s|$)/)
      .filter((s) => s.trim().length > 0);
    const sentenceCount = text.trim().length === 0 ? 0 : sentences.length;

    // Paragraphs: split by double newline
    const paragraphs = text
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0);
    const paragraphCount = text.trim().length === 0 ? 0 : paragraphs.length;

    // Average word length
    const avgWordLength =
      wordCount > 0
        ? (words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z0-9]/g, '').length, 0) / wordCount).toFixed(1)
        : '0.0';

    // Reading / speaking time
    const readingMinutes = wordCount / 200;
    const speakingMinutes = wordCount / 130;

    const formatTime = (mins: number) => {
      if (mins < 1) return '< 1 min';
      const m = Math.floor(mins);
      const s = Math.round((mins - m) * 60);
      return s > 0 ? `${m} min ${s} sec` : `${m} min`;
    };

    // Syllable count for readability
    const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

    // Flesch-Kincaid Grade Level
    let readabilityScore = 0;
    if (wordCount > 0 && sentenceCount > 0) {
      readabilityScore =
        0.39 * (wordCount / sentenceCount) +
        11.8 * (totalSyllables / wordCount) -
        15.59;
    }
    const readabilityLabel =
      wordCount === 0 || sentenceCount === 0
        ? 'N/A'
        : readabilityScore < 1
          ? '< 1st grade'
          : `Grade ${Math.round(readabilityScore)}`;

    // Top 5 most frequent words (excluding stop words)
    const freq: Record<string, number> = {};
    for (const w of words) {
      const cleaned = w.toLowerCase().replace(/[^a-z']/g, '');
      if (cleaned.length === 0 || STOP_WORDS.has(cleaned)) continue;
      freq[cleaned] = (freq[cleaned] || 0) + 1;
    }
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      wordCount,
      charCount,
      charNoSpaces,
      sentenceCount,
      paragraphCount,
      avgWordLength,
      readingTime: formatTime(readingMinutes),
      speakingTime: formatTime(speakingMinutes),
      readabilityLabel,
      topWords,
    };
  }, [text]);

  const statCards: StatCard[] = [
    { label: 'Words', value: stats.wordCount },
    { label: 'Characters', value: stats.charCount },
    { label: 'Characters (no spaces)', value: stats.charNoSpaces },
    { label: 'Sentences', value: stats.sentenceCount },
    { label: 'Paragraphs', value: stats.paragraphCount },
    { label: 'Avg Word Length', value: stats.avgWordLength },
    { label: 'Reading Time', value: stats.readingTime },
    { label: 'Speaking Time', value: stats.speakingTime },
    { label: 'Readability', value: stats.readabilityLabel },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        icon="🔢"
        title="Word Counter"
        description="Count words, characters, sentences, and check readability."
        aiPowered={false}
      />

      {/* Text Input */}
      <Card className="mb-6">
        <Textarea
          placeholder="Paste or type your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          showCount
          maxLength={100000}
          className="min-h-[200px]"
        />
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Top Words */}
      {stats.topWords.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Top 5 Most Frequent Words
          </h2>
          <div className="space-y-2">
            {stats.topWords.map(([word, count], i) => (
              <div
                key={word}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400 w-6">
                    {i + 1}.
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {word}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {count} {count === 1 ? 'time' : 'times'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
