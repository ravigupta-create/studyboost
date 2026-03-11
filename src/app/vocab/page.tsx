'use client';

import { useState } from 'react';
import { useGeminiJSON } from '@/hooks/useGemini';
import { useApiKey } from '@/hooks/useApiKey';
import { vocabPrompt } from '@/lib/prompts';
import { VocabWord } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

const posColors: Record<string, string> = {
  noun: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  verb: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  adjective: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  adverb: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  preposition: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  conjunction: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
};

function getPosColor(pos: string): string {
  const key = pos.toLowerCase().trim();
  return posColors[key] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
}

export default function VocabPage() {
  const { hasKey } = useApiKey();
  const { data: words, loading, generate } = useGeminiJSON<VocabWord[]>();
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader
          icon="📖"
          title="Vocabulary Builder"
          description="Paste any text and extract key vocabulary words with definitions and examples."
          aiPowered
        />
        <Card>
          <ApiKeySetup />
        </Card>
      </div>
    );
  }

  const handleExtract = async () => {
    if (!text.trim()) return;
    await generate(vocabPrompt(text));
  };

  const handleReadAloud = (word: string, definition: string) => {
    const utterance = new SpeechSynthesisUtterance(word + '. ' + definition);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyAll = () => {
    if (!words) return;
    const text = words
      .map((w) => `${w.word} (${w.partOfSpeech}): ${w.definition}\nExample: ${w.example}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        icon="📖"
        title="Vocabulary Builder"
        description="Paste any text and extract key vocabulary words with definitions and examples."
        aiPowered
      />

      <Card className="mb-6">
        <Textarea
          placeholder="Paste a paragraph, article, or any text to extract vocabulary words..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          showCount
          disabled={loading}
        />
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleExtract}
            disabled={loading || !text.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Extracting...
              </span>
            ) : (
              'Extract Vocabulary'
            )}
          </Button>
          {words && !loading && (
            <Button variant="secondary" onClick={() => setText('')}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {words && words.length > 0 && (
        <>
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={handleCopyAll}>
              {copied ? '\u2713 Copied!' : 'Copy All Words'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {words.map((word, i) => (
              <Card key={i} className="flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {word.word}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPosColor(
                      word.partOfSpeech
                    )}`}
                  >
                    {word.partOfSpeech}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {word.definition}
                </p>
                <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-3 flex-1">
                  &ldquo;{word.example}&rdquo;
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReadAloud(word.word, word.definition)}
                  className="self-start"
                >
                  🔊 Read Aloud
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
