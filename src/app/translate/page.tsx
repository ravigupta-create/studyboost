'use client';

import { useState } from 'react';
import { useGeminiStream } from '@/hooks/useGemini';
import { useApiKey } from '@/hooks/useApiKey';
import { translatePrompt } from '@/lib/prompts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

const languages = [
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese (Mandarin)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Russian',
];

export default function TranslatePage() {
  const { hasKey } = useApiKey();
  const { output, loading, generate, stop } = useGeminiStream();
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadAloud = () => {
    if (!output) return;
    // Get the first paragraph as the raw translation
    const firstParagraph = output.split('\n').find((line) => line.trim() && !line.startsWith('#'));
    if (firstParagraph) {
      // Strip markdown formatting
      const clean = firstParagraph.replace(/[*_`#>\-]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader
          icon="🌍"
          title="Language Translator"
          description="Translate text to any language with vocabulary notes and grammar tips for learning."
          aiPowered
        />
        <Card>
          <ApiKeySetup />
        </Card>
      </div>
    );
  }

  const handleTranslate = async () => {
    if (!text.trim()) return;
    await generate(translatePrompt(text, targetLang));
  };

  const handleClear = () => {
    setText('');
    stop();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        icon="🌍"
        title="Language Translator"
        description="Translate text to any language with vocabulary notes and grammar tips for learning."
        aiPowered
      />

      <Card className="mb-6">
        <div className="space-y-4">
          <Textarea
            placeholder="Enter text to translate..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            showCount
            disabled={loading}
          />
          <Select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            disabled={loading}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Translating...
              </span>
            ) : (
              'Translate'
            )}
          </Button>
          {loading && (
            <Button variant="danger" onClick={stop}>
              Stop
            </Button>
          )}
          {(output || text) && !loading && (
            <Button variant="secondary" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {output && (
        <Card>
          <div className="flex justify-end gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={handleReadAloud}>
              🔊 Read Aloud
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? '\u2713 Copied!' : 'Copy'}
            </Button>
          </div>
          <MarkdownRenderer content={output} />
        </Card>
      )}
    </div>
  );
}
