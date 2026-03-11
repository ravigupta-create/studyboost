'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGeminiJSON } from '@/hooks/useGemini';
import { useApiKey } from '@/hooks/useApiKey';
import { quizPrompt } from '@/lib/prompts';
import { QuizQuestion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

export default function QuizPage() {
  const { hasKey } = useApiKey();
  const { data: questions, loading, generate } = useGeminiJSON<QuizQuestion[]>();
  const [notes, setNotes] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const score = useMemo(() => {
    if (!questions) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctIndex) correct++;
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  }, [questions, selectedAnswers]);

  // Keyboard support for quiz phase
  useEffect(() => {
    if (!questions || showResult) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const hasAnswered = selectedAnswers[currentIndex] !== undefined;

      // Keys 1-4 to select answers
      if (!hasAnswered && e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < questions[currentIndex].options.length) {
          setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
        }
      }

      // Enter to go next
      if (e.key === 'Enter' && hasAnswered) {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setShowResult(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions, showResult, currentIndex, selectedAnswers]);

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader
          icon="&#10067;"
          title="Quiz Generator"
          description="Turn your notes into interactive quiz questions with instant scoring."
          aiPowered
        />
        <Card>
          <ApiKeySetup />
        </Card>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResult(false);
    await generate(quizPrompt(notes));
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (!questions) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleTryAgain = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResult(false);
  };

  const handleNewQuiz = () => {
    setNotes('');
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResult(false);
  };

  // --- Input phase ---
  if (!questions) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader
          icon="&#10067;"
          title="Quiz Generator"
          description="Turn your notes into interactive quiz questions with instant scoring."
          aiPowered
        />
        <Card>
          <Textarea
            placeholder="Paste your study notes here to generate a quiz..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            showCount
            disabled={loading}
          />
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleGenerate}
              disabled={loading || !notes.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Generating Quiz...
                </span>
              ) : (
                'Generate Quiz'
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- Score summary phase ---
  if (showResult) {
    const { correct, total, percentage } = score;
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader
          icon="&#10067;"
          title="Quiz Generator"
          description="Turn your notes into interactive quiz questions with instant scoring."
          aiPowered
        />
        <Card className="text-center">
          <div className="py-8">
            <div className="text-6xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              {correct}/{total}
            </div>
            <div className="text-2xl font-semibold mb-1 text-gray-700 dark:text-gray-300">
              {percentage}%
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {percentage === 100
                ? 'Perfect score! Excellent work!'
                : percentage >= 70
                ? 'Great job! Keep studying to improve.'
                : 'Keep practicing, you\'ll get there!'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleTryAgain} variant="secondary">
                Try Again
              </Button>
              <Button onClick={handleNewQuiz}>
                New Quiz
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // --- Quiz phase ---
  const currentQuestion = questions[currentIndex];
  const hasAnswered = selectedAnswers[currentIndex] !== undefined;
  const selectedOption = selectedAnswers[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="&#10067;"
        title="Quiz Generator"
        description="Turn your notes into interactive quiz questions with instant scoring."
        aiPowered
      />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-colors ${
                i === currentIndex
                  ? 'bg-purple-600'
                  : selectedAnswers[i] !== undefined
                  ? selectedAnswers[i] === questions[i].correctIndex
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, i) => {
            const isCorrect = i === currentQuestion.correctIndex;
            const isSelected = selectedOption === i;

            let optionClass =
              'w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm ';

            if (!hasAnswered) {
              optionClass +=
                'border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 cursor-pointer';
            } else if (isCorrect) {
              optionClass +=
                'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
            } else if (isSelected && !isCorrect) {
              optionClass +=
                'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
            } else {
              optionClass +=
                'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500';
            }

            return (
              <button
                key={i}
                className={optionClass}
                onClick={() => handleSelectAnswer(i)}
                disabled={hasAnswered}
                aria-label={`Option ${String.fromCharCode(65 + i)}: ${option}`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold border-current">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
              Explanation
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </Card>

      {hasAnswered && (
        <div className="flex justify-end">
          <Button onClick={handleNext}>
            {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
          </Button>
        </div>
      )}
    </div>
  );
}
