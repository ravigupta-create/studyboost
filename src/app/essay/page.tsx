'use client';

import { useState } from 'react';
import { useGeminiStream } from '@/hooks/useGemini';
import { useApiKey } from '@/hooks/useApiKey';
import { essayPrompt } from '@/lib/prompts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

export default function EssayPage() {
  const { hasKey } = useApiKey();
  const { output, loading, generate, stop } = useGeminiStream();
  const [topic, setTopic] = useState('');

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader
          icon="✍️"
          title="Essay Outline Generator"
          description="Input a topic and get a structured, detailed essay outline."
          aiPowered
        />
        <Card>
          <ApiKeySetup />
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!topic.trim()) return;
    await generate(essayPrompt(topic));
  };

  const handleClear = () => {
    setTopic('');
    stop();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="✍️"
        title="Essay Outline Generator"
        description="Input a topic and get a structured, detailed essay outline."
        aiPowered
      />

      <Card className="mb-6">
        <Input
          placeholder="Enter your essay topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
          disabled={loading}
        />
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleSubmit}
            disabled={loading || !topic.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Generating...
              </span>
            ) : (
              'Generate Outline'
            )}
          </Button>
          {loading && (
            <Button variant="danger" onClick={stop}>
              Stop
            </Button>
          )}
          {(output || topic) && !loading && (
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
