'use client';

import { useState, useMemo } from 'react';
import { useGeminiStream } from '@/hooks/useGemini';
import { useApiKey } from '@/hooks/useApiKey';
import { writingFeedbackPrompt } from '@/lib/prompts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

export default function FeedbackPage() {
  const { hasKey } = useApiKey();
  const { output, loading, generate, stop } = useGeminiStream();
  const [essay, setEssay] = useState('');
  const [copied, setCopied] = useState(false);

  const wordCount = useMemo(() => {
    const trimmed = essay.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [essay]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader
          icon="📝"
          title="Writing Feedback"
          description="Paste your essay or writing and get detailed, constructive AI feedback."
          aiPowered
        />
        <Card>
          <ApiKeySetup />
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!essay.trim()) return;
    await generate(writingFeedbackPrompt(essay));
  };

  const handleClear = () => {
    setEssay('');
    stop();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        icon="📝"
        title="Writing Feedback"
        description="Paste your essay or writing and get detailed, constructive AI feedback."
        aiPowered
      />

      <Card className="mb-6">
        <Textarea
          placeholder="Paste your essay or writing here..."
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          showCount
          disabled={loading}
          className="min-h-[200px]"
        />
        <div className="flex items-center justify-between mt-2 mb-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={loading || !essay.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Analyzing...
              </span>
            ) : (
              'Get Feedback'
            )}
          </Button>
          {loading && (
            <Button variant="danger" onClick={stop}>
              Stop
            </Button>
          )}
          {(output || essay) && !loading && (
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
