'use client';

import { useState } from 'react';
import { useGeminiStream } from '@/hooks/useGemini';
import { useApiKey } from '@/hooks/useApiKey';
import { summarizerPrompt } from '@/lib/prompts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

export default function SummarizerPage() {
  const { hasKey } = useApiKey();
  const { output, loading, generate, stop } = useGeminiStream();
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader
          icon="📝"
          title="Note Summarizer"
          description="Condense long notes into concise, organized bullet-point summaries."
          aiPowered
        />
        <Card>
          <ApiKeySetup />
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    await generate(summarizerPrompt(notes));
  };

  const handleClear = () => {
    setNotes('');
    stop();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="📝"
        title="Note Summarizer"
        description="Condense long notes into concise, organized bullet-point summaries."
        aiPowered
      />

      <Card className="mb-6">
        <Textarea
          placeholder="Paste your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          showCount
          disabled={loading}
        />
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleSubmit}
            disabled={loading || !notes.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Summarizing...
              </span>
            ) : (
              'Summarize'
            )}
          </Button>
          {loading && (
            <Button variant="danger" onClick={stop}>
              Stop
            </Button>
          )}
          {(output || notes) && !loading && (
            <Button variant="secondary" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {output && (
        <Card>
          <div className="flex justify-end mb-2">
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
