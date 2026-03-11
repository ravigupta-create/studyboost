'use client';

import { useState } from 'react';
import { useGeminiStream } from '@/hooks/useGemini';
import { useApiKey } from '@/hooks/useApiKey';
import { mathPrompt } from '@/lib/prompts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

export default function MathPage() {
  const { hasKey } = useApiKey();
  const { output, loading, generate, stop } = useGeminiStream();
  const [problem, setProblem] = useState('');

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader
          icon="🧮"
          title="Math Problem Solver"
          description="Get step-by-step solutions for algebra, calculus, and more."
          aiPowered
        />
        <Card>
          <ApiKeySetup />
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!problem.trim()) return;
    await generate(mathPrompt(problem));
  };

  const handleClear = () => {
    setProblem('');
    stop();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="🧮"
        title="Math Problem Solver"
        description="Get step-by-step solutions for algebra, calculus, and more."
        aiPowered
      />

      <Card className="mb-6">
        <Textarea
          placeholder="Type or paste your math problem here..."
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          showCount
          disabled={loading}
        />
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleSubmit}
            disabled={loading || !problem.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Solving...
              </span>
            ) : (
              'Solve'
            )}
          </Button>
          {loading && (
            <Button variant="danger" onClick={stop}>
              Stop
            </Button>
          )}
          {(output || problem) && !loading && (
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
