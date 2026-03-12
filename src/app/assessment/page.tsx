'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { useAssessment } from '@/hooks/useAssessment';
import { useStudyStats } from '@/hooks/useStudyStats';
import { useToast } from '@/hooks/useToast';
import { callGeminiJSON } from '@/lib/gemini';
import { assessmentPrompt } from '@/lib/prompts';
import { COURSES, type Course } from '@/lib/curriculum';
import { AssessmentQuestion, AssessmentResult, UnitScore } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';
import { MathText } from '@/components/shared/MathText';
import Link from 'next/link';

type Phase = 'select' | 'loading' | 'quiz' | 'results';

export default function AssessmentPage() {
  const { hasKey, apiKey } = useApiKey();
  const { saveResult, getResults } = useAssessment();
  const { logSession } = useStudyStats();
  const { addToast } = useToast();

  const [phase, setPhase] = useState<Phase>('select');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loadingProgress, setLoadingProgress] = useState('');
  const [startTime, setStartTime] = useState(0);

  const handleSelectCourse = useCallback(async (course: Course) => {
    if (!apiKey) return;
    setSelectedCourse(course);
    setPhase('loading');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setStartTime(Date.now());

    const units = course.units;
    const batchSize = 4;
    const batches: typeof units[] = [];
    for (let i = 0; i < units.length; i += batchSize) {
      batches.push(units.slice(i, i + batchSize));
    }

    try {
      const allQuestions: AssessmentQuestion[] = [];
      const results = await Promise.all(
        batches.map(async (batch, batchIdx) => {
          setLoadingProgress(`Generating questions... (batch ${batchIdx + 1}/${batches.length})`);
          const unitData = batch.map(u => ({
            id: u.id,
            name: u.name,
            topicNames: u.topics.map(t => t.name),
          }));
          return callGeminiJSON<AssessmentQuestion[]>(apiKey, assessmentPrompt(unitData));
        })
      );

      for (const batch of results) {
        if (Array.isArray(batch)) {
          allQuestions.push(...batch);
        }
      }

      if (allQuestions.length === 0) {
        throw new Error('No questions were generated.');
      }

      setQuestions(allQuestions);
      setPhase('quiz');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate assessment.';
      addToast(msg, 'error');
      setPhase('select');
    }
  }, [apiKey, addToast]);

  // Keyboard support
  useEffect(() => {
    if (phase !== 'quiz') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const hasAnswered = answers[currentIndex] !== undefined;
      if (!hasAnswered && e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key) - 1;
        if (idx < (questions[currentIndex]?.options?.length ?? 0)) {
          setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
        }
      }
      if (e.key === 'Enter' && hasAnswered) {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          finishQuiz();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const unitScores = useMemo((): UnitScore[] => {
    if (!selectedCourse || questions.length === 0) return [];
    const scoreMap: Record<string, { correct: number; total: number; name: string }> = {};
    selectedCourse.units.forEach(u => {
      scoreMap[u.id] = { correct: 0, total: 0, name: u.name };
    });
    questions.forEach((q, i) => {
      if (!scoreMap[q.unitId]) {
        scoreMap[q.unitId] = { correct: 0, total: 0, name: q.unitId };
      }
      scoreMap[q.unitId].total++;
      if (answers[i] === q.correctIndex) {
        scoreMap[q.unitId].correct++;
      }
    });
    return Object.entries(scoreMap)
      .filter(([, v]) => v.total > 0)
      .map(([unitId, v]) => ({
        unitId,
        unitName: v.name,
        correct: v.correct,
        total: v.total,
        percentage: Math.round((v.correct / v.total) * 100),
      }));
  }, [selectedCourse, questions, answers]);

  const overallPercentage = useMemo(() => {
    if (unitScores.length === 0) return 0;
    const total = unitScores.reduce((s, u) => s + u.total, 0);
    const correct = unitScores.reduce((s, u) => s + u.correct, 0);
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }, [unitScores]);

  const finishQuiz = useCallback(() => {
    if (!selectedCourse) return;
    const result: AssessmentResult = {
      courseId: selectedCourse.id,
      date: new Date().toISOString(),
      unitScores,
      overallPercentage,
      questions,
      answers,
    };
    saveResult(result);
    const duration = Math.round((Date.now() - startTime) / 1000);
    logSession('assessment', duration, overallPercentage);
    setPhase('results');
  }, [selectedCourse, unitScores, overallPercentage, questions, answers, saveResult, logSession, startTime]);

  if (!hasKey) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PageHeader icon="&#x1F4CA;" title="Assessment Mode" description="Diagnostic math assessment with personalized AI lessons." aiPowered />
        <Card><ApiKeySetup /></Card>
      </div>
    );
  }

  // Phase 1: Course Selection
  if (phase === 'select') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PageHeader icon="&#x1F4CA;" title="Assessment Mode" description="Choose your course, take a diagnostic assessment, and get personalized lessons." aiPowered />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COURSES.map(course => {
            const topicCount = course.units.reduce((s, u) => s + u.topics.length, 0);
            const pastResults = getResults(course.id);
            return (
              <Card key={course.id} hover className="cursor-pointer" onClick={() => handleSelectCourse(course)}>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{course.name}</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                    <p>{course.units.length} units</p>
                    <p>{topicCount} topics</p>
                    <p>{course.units.length * 2} questions</p>
                  </div>
                  {pastResults.length > 0 && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                      Last score: {pastResults[pastResults.length - 1].overallPercentage}%
                    </p>
                  )}
                  <Button size="sm" className="w-full">Start Assessment</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Phase 2: Loading
  if (phase === 'loading') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader icon="&#x1F4CA;" title="Assessment Mode" description="Generating your assessment..." aiPowered />
        <Card className="text-center py-12">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">{loadingProgress || 'Preparing questions...'}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Generating {selectedCourse?.units.length ? selectedCourse.units.length * 2 : ''} questions across {selectedCourse?.units.length} units
          </p>
        </Card>
      </div>
    );
  }

  // Phase 3: Quiz
  if (phase === 'quiz' && questions.length > 0) {
    const currentQ = questions[currentIndex];
    const hasAnswered = answers[currentIndex] !== undefined;
    const selectedOption = answers[currentIndex];

    // Find unit header
    const currentUnitId = currentQ.unitId;
    const isNewUnit = currentIndex === 0 || questions[currentIndex - 1]?.unitId !== currentUnitId;
    const unitName = selectedCourse?.units.find(u => u.id === currentUnitId)?.name || currentUnitId;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader icon="&#x1F4CA;" title="Assessment Mode" description={selectedCourse?.name || ''} aiPowered />

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex-1 ml-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {isNewUnit && (
          <div className="mb-4 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">{unitName}</span>
          </div>
        )}

        <Card className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            <MathText text={currentQ.question} />
          </h2>

          <div className="space-y-3">
            {currentQ.options.map((option, i) => {
              const isCorrect = i === currentQ.correctIndex;
              const isSelected = selectedOption === i;

              let optionClass = 'w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm ';
              if (!hasAnswered) {
                optionClass += 'border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 cursor-pointer';
              } else if (isCorrect) {
                optionClass += 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
              } else if (isSelected && !isCorrect) {
                optionClass += 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
              } else {
                optionClass += 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500';
              }

              return (
                <button
                  key={i}
                  className={optionClass}
                  onClick={() => { if (!hasAnswered) setAnswers(prev => ({ ...prev, [currentIndex]: i })); }}
                  disabled={hasAnswered}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold border-current">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <MathText text={option} />
                  </span>
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Explanation</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <MathText text={currentQ.explanation} />
              </p>
            </div>
          )}
        </Card>

        {hasAnswered && (
          <div className="flex justify-end">
            <Button onClick={() => {
              if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
              } else {
                finishQuiz();
              }
            }}>
              {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Phase 4: Results
  if (phase === 'results' && selectedCourse) {
    const totalCorrect = unitScores.reduce((s, u) => s + u.correct, 0);
    const totalQuestions = unitScores.reduce((s, u) => s + u.total, 0);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PageHeader icon="&#x1F4CA;" title="Assessment Results" description={selectedCourse.name} aiPowered />

        <Card className="text-center mb-6">
          <div className="py-6">
            <div className="text-6xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              {totalCorrect}/{totalQuestions}
            </div>
            <div className="text-2xl font-semibold mb-1 text-gray-700 dark:text-gray-300">
              {overallPercentage}%
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {overallPercentage >= 90 ? 'Excellent! You have strong mastery across units.'
                : overallPercentage >= 70 ? 'Good work! Review the units below to strengthen weak areas.'
                : 'Keep studying! Check the lessons for topics that need review.'}
            </p>
          </div>
        </Card>

        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Per-Unit Scores</h3>
          <div className="space-y-3">
            {unitScores.map(us => {
              const barColor = us.percentage >= 80 ? 'bg-green-500' : us.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
              const badge = us.percentage >= 80 ? 'Proficient' : us.percentage >= 50 ? 'Developing' : 'Needs Review';
              const badgeColor = us.percentage >= 80
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : us.percentage >= 50
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';

              return (
                <div key={us.unitId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{us.unitName}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{us.correct}/{us.total}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${us.percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => { setPhase('select'); setSelectedCourse(null); }}>
            Retake
          </Button>
          <Link href={`/assessment/lessons?course=${selectedCourse.id}`}>
            <Button>View Lessons</Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
