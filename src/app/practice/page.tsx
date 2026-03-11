'use client';

import { useState } from 'react';
import { useGeminiJSON } from '@/hooks/useGemini';
import { useApiKey } from '@/hooks/useApiKey';
import { practicePrompt } from '@/lib/prompts';
import { PracticeProblem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  hard: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

export default function PracticePage() {
  const { hasKey } = useApiKey();
  const { data: problems, loading, generate } = useGeminiJSON<PracticeProblem[]>();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [showSolutions, setShowSolutions] = useState<Record<number, boolean>>({});

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader
          icon="🏋️"
          title="Practice Problems"
          description="Generate practice problems with hints and step-by-step solutions for any topic."
          aiPowered
        />
        <Card>
          <ApiKeySetup />
        </Card>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setShowHints({});
    setShowSolutions({});
    await generate(practicePrompt(topic, difficulty));
  };

  const toggleHint = (index: number) => {
    setShowHints((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleSolution = (index: number) => {
    setShowSolutions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        icon="🏋️"
        title="Practice Problems"
        description="Generate practice problems with hints and step-by-step solutions for any topic."
        aiPowered
      />

      <Card className="mb-6">
        <div className="space-y-4">
          <Input
            placeholder="Enter a topic (e.g., Quadratic equations, Photosynthesis, French Revolution)..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
            disabled={loading}
            maxLength={200}
          />
          <Select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={loading}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Generating...
              </span>
            ) : (
              'Generate Problems'
            )}
          </Button>
          {problems && !loading && (
            <Button variant="secondary" onClick={() => setTopic('')}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {problems && problems.length > 0 && (
        <div className="space-y-4">
          {problems.map((problem, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Problem {i + 1}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    difficultyColors[problem.difficulty] || difficultyColors.medium
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                {problem.problem}
              </p>

              <div className="flex gap-2 mb-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleHint(i)}
                >
                  {showHints[i] ? 'Hide Hint' : 'Show Hint'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleSolution(i)}
                >
                  {showSolutions[i] ? 'Hide Solution' : 'Show Solution'}
                </Button>
              </div>

              {showHints[i] && (
                <div className="mb-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                    Hint
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    {problem.hint}
                  </p>
                </div>
              )}

              {showSolutions[i] && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                    Solution
                  </p>
                  <MarkdownRenderer content={problem.solution} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
