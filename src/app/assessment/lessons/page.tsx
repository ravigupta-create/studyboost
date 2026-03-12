'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApiKey } from '@/hooks/useApiKey';
import { useAssessment } from '@/hooks/useAssessment';
import { useGeminiStream } from '@/hooks/useGemini';
import { useToast } from '@/hooks/useToast';
import { callGeminiJSON } from '@/lib/gemini';
import { lessonPrompt, masteryQuizPrompt } from '@/lib/prompts';
import { COURSES, type Course, type Topic, type Unit } from '@/lib/curriculum';
import { QuizQuestion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { MathText } from '@/components/shared/MathText';

const IDK = -1;
const MASTERY_THRESHOLD = 4; // out of 5

type LessonPhase = 'learn' | 'quiz-loading' | 'quiz' | 'result';

export default function LessonsPage() {
  const { hasKey, apiKey } = useApiKey();
  const searchParams = useSearchParams();
  const { results, lessonProgress, markLessonComplete, markLessonViewed } = useAssessment();
  const { output, loading: lessonLoading, generate, stop } = useGeminiStream();
  const { addToast } = useToast();

  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('course') || COURSES[0].id);
  const [activeTopic, setActiveTopic] = useState<{ course: Course; unit: Unit; topic: Topic } | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  // Mastery quiz state
  const [lessonPhase, setLessonPhase] = useState<LessonPhase>('learn');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  const selectedCourse = useMemo(() => COURSES.find(c => c.id === selectedCourseId) || COURSES[0], [selectedCourseId]);

  const latestResult = useMemo(() => {
    const courseResults = results.filter(r => r.courseId === selectedCourseId);
    return courseResults.length > 0 ? courseResults[courseResults.length - 1] : null;
  }, [results, selectedCourseId]);

  const unitScoreMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (latestResult) {
      latestResult.unitScores.forEach(us => { map[us.unitId] = us.percentage; });
    }
    return map;
  }, [latestResult]);

  const unitSkipMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (latestResult) {
      latestResult.questions.forEach((q, i) => {
        if (latestResult.answers[i] === IDK) {
          map[q.unitId] = true;
        }
      });
    }
    return map;
  }, [latestResult]);

  const completionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    lessonProgress.forEach(lp => { map[lp.topicId] = lp.completed; });
    return map;
  }, [lessonProgress]);

  const filteredUnits = useMemo(() => {
    const unitsFromAssessment = !latestResult ? selectedCourse.units : selectedCourse.units.filter(unit => {
      const score = unitScoreMap[unit.id];
      const hadSkips = unitSkipMap[unit.id];
      return score === undefined || score < 100 || hadSkips;
    });
    return unitsFromAssessment.filter(unit =>
      unit.topics.some(topic => !completionMap[topic.id])
    );
  }, [selectedCourse, latestResult, unitScoreMap, unitSkipMap, completionMap]);

  const masteredUnitCount = useMemo(() => {
    return selectedCourse.units.length - filteredUnits.length;
  }, [selectedCourse, filteredUnits]);

  const masteredTopicCount = useMemo(() => {
    return selectedCourse.units.reduce((sum, unit) =>
      sum + unit.topics.filter(t => completionMap[t.id]).length, 0
    );
  }, [selectedCourse, completionMap]);

  const toggleUnit = useCallback((unitId: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  }, []);

  const unmasteredTopics = useMemo(() => {
    return filteredUnits.flatMap(unit =>
      unit.topics
        .filter(topic => !completionMap[topic.id])
        .map(topic => ({ course: selectedCourse, unit, topic }))
    );
  }, [filteredUnits, selectedCourse, completionMap]);

  const startLesson = useCallback((course: Course, unit: Unit, topic: Topic) => {
    stop();
    setActiveTopic({ course, unit, topic });
    setLessonPhase('learn');
    setQuizQuestions([]);
    setQuizIndex(0);
    setQuizAnswers({});
    markLessonViewed(topic.id);
    generate(lessonPrompt(course.name, unit.name, topic.name, topic.description));
  }, [generate, stop, markLessonViewed]);

  // Start the mastery quiz after reading the lesson
  const startMasteryQuiz = useCallback(async () => {
    if (!activeTopic || !apiKey) return;
    setLessonPhase('quiz-loading');
    try {
      const questions = await callGeminiJSON<QuizQuestion[]>(
        apiKey,
        masteryQuizPrompt(
          activeTopic.course.name,
          activeTopic.unit.name,
          activeTopic.topic.name,
          activeTopic.topic.description,
        )
      );
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('No questions generated.');
      }
      setQuizQuestions(questions);
      setQuizIndex(0);
      setQuizAnswers({});
      setLessonPhase('quiz');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate quiz.';
      addToast(msg, 'error');
      setLessonPhase('learn');
    }
  }, [activeTopic, apiKey, addToast]);

  // Quiz score
  const quizScore = useMemo(() => {
    if (quizQuestions.length === 0) return { correct: 0, total: 0 };
    let correct = 0;
    quizQuestions.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) correct++;
    });
    return { correct, total: quizQuestions.length };
  }, [quizQuestions, quizAnswers]);

  const isMastered = quizScore.correct >= MASTERY_THRESHOLD;

  // Finish quiz: auto-determine mastery
  const finishMasteryQuiz = useCallback(() => {
    setLessonPhase('result');
    if (isMastered && activeTopic) {
      markLessonComplete(activeTopic.topic.id);
    }
  }, [isMastered, activeTopic, markLessonComplete]);

  // After mastery result, go to next topic
  const goToNextTopic = useCallback(() => {
    if (!activeTopic) return;
    const remaining = unmasteredTopics.filter(t => t.topic.id !== activeTopic.topic.id);
    if (remaining.length === 0) {
      stop();
      setActiveTopic(null);
    } else {
      const currentIdx = unmasteredTopics.findIndex(t => t.topic.id === activeTopic.topic.id);
      const nextIdx = Math.min(currentIdx, remaining.length - 1);
      startLesson(remaining[nextIdx].course, remaining[nextIdx].unit, remaining[nextIdx].topic);
    }
  }, [activeTopic, unmasteredTopics, stop, startLesson]);

  // Retry: go back to lesson
  const retryLesson = useCallback(() => {
    if (!activeTopic) return;
    startLesson(activeTopic.course, activeTopic.unit, activeTopic.topic);
  }, [activeTopic, startLesson]);

  // Keyboard support for quiz
  useEffect(() => {
    if (lessonPhase !== 'quiz' || quizQuestions.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const hasAnswered = quizAnswers[quizIndex] !== undefined;
      if (!hasAnswered && e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key) - 1;
        if (idx < (quizQuestions[quizIndex]?.options?.length ?? 0)) {
          setQuizAnswers(prev => ({ ...prev, [quizIndex]: idx }));
        }
      }
      if (e.key === 'Enter' && hasAnswered) {
        if (quizIndex < quizQuestions.length - 1) {
          setQuizIndex(prev => prev + 1);
        } else {
          finishMasteryQuiz();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Auto-expand units
  useEffect(() => {
    if (latestResult) {
      const needsWork = new Set<string>();
      filteredUnits.forEach(u => needsWork.add(u.id));
      if (needsWork.size > 0) setExpandedUnits(needsWork);
    }
  }, [latestResult, filteredUnits]);

  if (!hasKey) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PageHeader icon="&#x1F4D6;" title="Lessons" description="AI-generated lessons for topics you need to master." aiPowered />
        <Card><ApiKeySetup /></Card>
      </div>
    );
  }

  // ==================== LESSON VIEW ====================
  if (activeTopic) {
    // --- Phase: Learning ---
    if (lessonPhase === 'learn') {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => { stop(); setActiveTopic(null); }}>
              &larr; Back to Topics
            </Button>
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {activeTopic.unit.name} &rsaquo; {activeTopic.topic.name}
            </span>
          </div>

          <Card className="mb-4">
            {lessonLoading && !output && (
              <div className="text-center py-12">
                <Spinner className="h-8 w-8 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Generating lesson...</p>
              </div>
            )}
            {output && <MarkdownRenderer content={output} />}
            {lessonLoading && output && (
              <div className="flex justify-center mt-4">
                <Button variant="secondary" size="sm" onClick={stop}>Stop Generating</Button>
              </div>
            )}
          </Card>

          {!lessonLoading && output && (
            <div className="flex justify-end">
              <Button onClick={startMasteryQuiz}>
                Ready — Take Mastery Quiz
              </Button>
            </div>
          )}
        </div>
      );
    }

    // --- Phase: Quiz Loading ---
    if (lessonPhase === 'quiz-loading') {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setLessonPhase('learn')}>
              &larr; Back to Lesson
            </Button>
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {activeTopic.topic.name} &rsaquo; Mastery Quiz
            </span>
          </div>
          <Card className="text-center py-12">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Generating mastery quiz...</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">5 questions to check your understanding</p>
          </Card>
        </div>
      );
    }

    // --- Phase: Quiz ---
    if (lessonPhase === 'quiz' && quizQuestions.length > 0) {
      const currentQ = quizQuestions[quizIndex];
      const currentAnswer = quizAnswers[quizIndex];
      const hasAnswered = currentAnswer !== undefined;

      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
              Mastery Quiz: {activeTopic.topic.name}
            </span>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Question {quizIndex + 1} of {quizQuestions.length}
            </span>
            <div className="flex gap-1">
              {quizQuestions.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    i === quizIndex
                      ? 'bg-purple-600'
                      : quizAnswers[i] !== undefined
                        ? quizAnswers[i] === quizQuestions[i].correctIndex
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
              <MathText text={currentQ.question} />
            </h2>

            <div className="space-y-3">
              {currentQ.options.map((option, i) => {
                const isCorrect = i === currentQ.correctIndex;
                const isSelected = currentAnswer === i;

                let cls = 'w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm ';
                if (!hasAnswered) {
                  cls += 'border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 cursor-pointer';
                } else if (isCorrect) {
                  cls += 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
                } else if (isSelected && !isCorrect) {
                  cls += 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
                } else {
                  cls += 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500';
                }

                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => { if (!hasAnswered) setQuizAnswers(prev => ({ ...prev, [quizIndex]: i })); }}
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
              <div className={`mt-6 p-4 rounded-lg border ${
                currentAnswer === currentQ.correctIndex
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <p className={`text-sm font-semibold mb-1 ${
                  currentAnswer === currentQ.correctIndex
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {currentAnswer === currentQ.correctIndex ? 'Correct!' : 'Incorrect'}
                </p>
                <p className={`text-sm ${
                  currentAnswer === currentQ.correctIndex
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  <MathText text={currentQ.explanation} />
                </p>
              </div>
            )}
          </Card>

          {hasAnswered && (
            <div className="flex justify-end">
              <Button onClick={() => {
                if (quizIndex < quizQuestions.length - 1) {
                  setQuizIndex(prev => prev + 1);
                } else {
                  finishMasteryQuiz();
                }
              }}>
                {quizIndex < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
              </Button>
            </div>
          )}
        </div>
      );
    }

    // --- Phase: Result ---
    if (lessonPhase === 'result') {
      const { correct, total } = quizScore;
      const passed = correct >= MASTERY_THRESHOLD;

      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Card className="text-center py-8">
            <div className="text-5xl mb-3">{passed ? '\u2705' : '\u{1F4AA}'}</div>
            <div className="text-4xl font-bold mb-1 text-gray-900 dark:text-gray-100">
              {correct}/{total}
            </div>
            <p className={`text-lg font-semibold mb-2 ${passed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {passed ? 'Mastered!' : 'Not quite yet'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {activeTopic.topic.name}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              {passed
                ? 'You demonstrated mastery of this topic. It has been removed from your list.'
                : `You need ${MASTERY_THRESHOLD}/${total} correct to master this topic. Review the lesson and try again.`}
            </p>
            <div className="flex gap-3 justify-center">
              {passed ? (
                <>
                  <Button variant="secondary" onClick={() => { stop(); setActiveTopic(null); }}>
                    Back to Topics
                  </Button>
                  {unmasteredTopics.filter(t => t.topic.id !== activeTopic.topic.id).length > 0 && (
                    <Button onClick={goToNextTopic}>
                      Next Topic
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => { stop(); setActiveTopic(null); }}>
                    Back to Topics
                  </Button>
                  <Button onClick={retryLesson}>
                    Review Lesson & Retry
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      );
    }
  }

  // ==================== TOPIC OVERVIEW ====================
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader icon="&#x1F4D6;" title="Lessons" description="Only showing topics you need to learn. Mastered topics are hidden." aiPowered />

      <div className="mb-6">
        <Select value={selectedCourseId} onChange={e => { setSelectedCourseId(e.target.value); setExpandedUnits(new Set()); }}>
          {COURSES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>

      {!latestResult && (
        <Card className="mb-6 text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No assessment results yet for this course.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">Take an assessment first so we know what to teach you.</p>
          <a href="/assessment" className="text-purple-600 dark:text-purple-400 font-medium hover:underline text-sm">
            Take Assessment &rarr;
          </a>
        </Card>
      )}

      {latestResult && (
        <>
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {filteredUnits.length} unit{filteredUnits.length !== 1 ? 's' : ''} to learn
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {masteredUnitCount > 0 && <>{masteredUnitCount} unit{masteredUnitCount > 1 ? 's' : ''} mastered (hidden) &middot; </>}
                  {masteredTopicCount > 0 && <>{masteredTopicCount} topic{masteredTopicCount > 1 ? 's' : ''} mastered &middot; </>}
                  {unmasteredTopics.length} topic{unmasteredTopics.length !== 1 ? 's' : ''} remaining
                </p>
              </div>
              {unmasteredTopics.length > 0 && (
                <Button size="sm" onClick={() => {
                  const first = unmasteredTopics[0];
                  startLesson(first.course, first.unit, first.topic);
                }}>
                  Start Learning
                </Button>
              )}
            </div>
          </Card>

          {filteredUnits.length === 0 && unmasteredTopics.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-2xl mb-2">&#127881;</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">You&apos;ve mastered everything!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All topics for {selectedCourse.name} are complete. You&apos;ve mastered what you were assessed on.
              </p>
            </Card>
          )}
        </>
      )}

      <div className="space-y-3">
        {filteredUnits.map(unit => {
          const score = unitScoreMap[unit.id];
          const hadSkips = unitSkipMap[unit.id];
          const isExpanded = expandedUnits.has(unit.id);
          const completedCount = unit.topics.filter(t => completionMap[t.id]).length;
          const remainingCount = unit.topics.length - completedCount;

          return (
            <Card key={unit.id} className="overflow-hidden !p-0">
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                onClick={() => toggleUnit(unit.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg transition-transform ${isExpanded ? 'rotate-90' : ''}`}>&#x25B6;</span>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{unit.name}</span>
                    <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                      {remainingCount} topic{remainingCount !== 1 ? 's' : ''} remaining
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hadSkips && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium">
                      Needs Lesson
                    </span>
                  )}
                  {!hadSkips && score !== undefined && score < 100 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium">
                      Needs Review
                    </span>
                  )}
                  {score !== undefined && (
                    <span className={`text-sm font-medium ${score >= 80 ? 'text-yellow-600 dark:text-yellow-400' : score >= 50 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
                      {score}%
                    </span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 space-y-2">
                  {unit.topics.filter(topic => !completionMap[topic.id]).map(topic => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-300 dark:text-gray-600">{'\u25CB'}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{topic.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{topic.description}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => startLesson(selectedCourse, unit, topic)}
                      >
                        Learn
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
