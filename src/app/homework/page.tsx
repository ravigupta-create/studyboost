'use client';

import { useState } from 'react';
import { useGeminiStream } from '@/hooks/useGemini';
import { useApiKey } from '@/hooks/useApiKey';
import { homeworkPrompt } from '@/lib/prompts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

export default function HomeworkPage() {
  const { hasKey } = useApiKey();
  const { output, loading, generate, stop } = useGeminiStream();
  const [question, setQuestion] = useState('');

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader
          icon="📚"
          title="Homework Explainer"
          description="Paste any homework question and get a clear, step-by-step explanation."
          aiPowered
        />
        <Card>
          <ApiKeySetup />
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!question.trim()) return;
    await generate(homeworkPrompt(question));
  };

  const handleClear = () => {
    setQuestion('');
    stop();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="📚"
        title="Homework Explainer"
        description="Paste any homework question and get a clear, step-by-step explanation."
        aiPowered
      />

      <Card className="mb-6">
        <Textarea
          placeholder="Paste your homework question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          showCount
          disabled={loading}
        />
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleSubmit}
            disabled={loading || !question.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Explaining...
              </span>
            ) : (
              'Explain'
            )}
          </Button>
          {loading && (
            <Button variant="danger" onClick={stop}>
              Stop
            </Button>
          )}
          {(output || question) && !loading && (
            <Button variant="secondary" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {output && (
        <Card>
          <MarkdownRenderer content={output} />
        </Card>
      )}
    </div>
  );
}
