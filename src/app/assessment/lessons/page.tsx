'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApiKey } from '@/hooks/useApiKey';
import { useAssessment } from '@/hooks/useAssessment';
import { useGeminiStream } from '@/hooks/useGemini';
import { useToast } from '@/hooks/useToast';
import { callGeminiJSON } from '@/lib/gemini';
import { lessonPrompt, practiceProblemsPrompt } from '@/lib/prompts';
import { COURSES, type Course, type Topic, type Unit } from '@/lib/curriculum';
import { LessonProblem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { MathText } from '@/components/shared/MathText';

const IDK = -1;

// Weighted scoring: easy=1, medium=2, hard=3
// 5 problems: 2 easy (2pts) + 2 medium (4pts) + 1 hard (3pts) = 9 total
// Need 7/9 (78%) to master — can't just get easy ones right
const DIFFICULTY_POINTS: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
const MASTERY_POINTS = 7;
const TOTAL_POINTS = 9;

export default function LessonsPage() {
  const { hasKey, apiKey } = useApiKey();
  const searchParams = useSearchParams();
  const { results, lessonProgress, markLessonComplete, markLessonViewed } = useAssessment();
  const { output, loading: lessonLoading, generate, stop } = useGeminiStream();
  const { addToast } = useToast();

  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('course') || COURSES[0].id);
  const [activeTopic, setActiveTopic] = useState<{ course: Course; unit: Unit; topic: Topic } | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  // Practice problems state
  const [problems, setProblems] = useState<LessonProblem[]>([]);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [checkedProblems, setCheckedProblems] = useState<Record<number, number>>({}); // index -> selected option
  const [masteryResult, setMasteryResult] = useState<'mastered' | 'not-yet' | null>(null);

  const practiceRef = useRef<HTMLDivElement>(null);

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

  // Start lesson: stream teaching content + generate practice problems in parallel
  const startLesson = useCallback(async (course: Course, unit: Unit, topic: Topic) => {
    stop();
    setActiveTopic({ course, unit, topic });
    setProblems([]);
    setProblemsLoading(true);
    setCheckedProblems({});
    setMasteryResult(null);
    markLessonViewed(topic.id);

    // Start both in parallel
    generate(lessonPrompt(course.name, unit.name, topic.name, topic.description));

    if (apiKey) {
      try {
        const result = await callGeminiJSON<LessonProblem[]>(
          apiKey,
          practiceProblemsPrompt(course.name, unit.name, topic.name, topic.description)
        );
        if (Array.isArray(result) && result.length > 0) {
          setProblems(result);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to generate practice problems.';
        addToast(msg, 'error');
      } finally {
        setProblemsLoading(false);
      }
    }
  }, [generate, stop, markLessonViewed, apiKey, addToast]);

  // Check a single problem answer
  const checkAnswer = useCallback((problemIndex: number, selectedOption: number) => {
    setCheckedProblems(prev => {
      if (prev[problemIndex] !== undefined) return prev; // already checked
      return { ...prev, [problemIndex]: selectedOption };
    });
  }, []);

  // Calculate weighted score
  const scoreInfo = useMemo(() => {
    if (problems.length === 0) return null;
    const allChecked = problems.every((_, i) => checkedProblems[i] !== undefined);
    if (!allChecked) return null;

    let earned = 0;
    let total = 0;
    problems.forEach((p, i) => {
      const pts = DIFFICULTY_POINTS[p.difficulty] || 1;
      total += pts;
      if (checkedProblems[i] === p.correctIndex) {
        earned += pts;
      }
    });

    const correct = problems.filter((p, i) => checkedProblems[i] === p.correctIndex).length;
    return { earned, total: total || TOTAL_POINTS, correct, outOf: problems.length, mastered: earned >= MASTERY_POINTS };
  }, [problems, checkedProblems]);

  // Auto-determine mastery when all problems are checked
  useEffect(() => {
    if (scoreInfo && masteryResult === null) {
      if (scoreInfo.mastered) {
        setMasteryResult('mastered');
        if (activeTopic) {
          markLessonComplete(activeTopic.topic.id);
        }
      } else {
        setMasteryResult('not-yet');
      }
    }
  }, [scoreInfo, masteryResult, activeTopic, markLessonComplete]);

  // Navigate to next topic after mastery
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

  const retryLesson = useCallback(() => {
    if (!activeTopic) return;
    startLesson(activeTopic.course, activeTopic.unit, activeTopic.topic);
  }, [activeTopic, startLesson]);

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

  // ==================== LESSON VIEW (single page: teaching + practice) ====================
  if (activeTopic) {
    const allChecked = problems.length > 0 && problems.every((_, i) => checkedProblems[i] !== undefined);

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

        {/* === Teaching Content === */}
        <Card className="mb-6">
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

        {/* === Practice Problems (inline below lesson) === */}
        <div ref={practiceRef}>
          {problemsLoading && (
            <Card className="text-center py-8 mb-4">
              <Spinner className="h-6 w-6 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Generating practice problems...</p>
            </Card>
          )}

          {problems.length > 0 && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Practice Problems</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Check your answers below. You need {MASTERY_POINTS}/{TOTAL_POINTS} points to master this topic.
                  <span className="ml-1 text-xs">(Easy = {DIFFICULTY_POINTS.easy}pt, Medium = {DIFFICULTY_POINTS.medium}pts, Hard = {DIFFICULTY_POINTS.hard}pts)</span>
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {problems.map((problem, pIdx) => {
                  const isChecked = checkedProblems[pIdx] !== undefined;
                  const selectedOption = checkedProblems[pIdx];
                  const isCorrect = isChecked && selectedOption === problem.correctIndex;
                  const pts = DIFFICULTY_POINTS[problem.difficulty] || 1;

                  const diffColor = problem.difficulty === 'easy'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : problem.difficulty === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';

                  return (
                    <Card key={pIdx} className={isChecked ? (isCorrect ? '!border-green-300 dark:!border-green-700' : '!border-red-300 dark:!border-red-700') : ''}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Problem {pIdx + 1}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor}`}>
                          {problem.difficulty} ({pts}pt{pts > 1 ? 's' : ''})
                        </span>
                        {isChecked && (
                          <span className={`text-xs font-semibold ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isCorrect ? `+${pts}` : '+0'}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                        <MathText text={problem.question} />
                      </p>

                      <div className="space-y-2">
                        {problem.options.map((option, oIdx) => {
                          const optIsCorrect = oIdx === problem.correctIndex;
                          const optIsSelected = selectedOption === oIdx;

                          let cls = 'w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all duration-200 text-sm ';
                          if (!isChecked) {
                            cls += 'border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 cursor-pointer';
                          } else if (optIsCorrect) {
                            cls += 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
                          } else if (optIsSelected && !optIsCorrect) {
                            cls += 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
                          } else {
                            cls += 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500';
                          }

                          return (
                            <button
                              key={oIdx}
                              className={cls}
                              onClick={() => checkAnswer(pIdx, oIdx)}
                              disabled={isChecked}
                            >
                              <span className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold border-current">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <MathText text={option} />
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Step-by-step solution shown after checking */}
                      {isChecked && (
                        <div className={`mt-4 p-4 rounded-lg border ${
                          isCorrect
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                          <p className={`text-sm font-semibold mb-2 ${
                            isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                          }`}>
                            {isCorrect ? 'Correct!' : 'Incorrect — here\'s how to solve it:'}
                          </p>
                          <div className={`text-sm ${
                            isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            <MarkdownRenderer content={problem.solution} />
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* === Mastery Result (appears after all checked) === */}
              {allChecked && scoreInfo && (
                <Card className={`text-center py-6 mb-4 ${
                  scoreInfo.mastered
                    ? '!border-green-300 dark:!border-green-700 bg-green-50 dark:bg-green-900/10'
                    : '!border-amber-300 dark:!border-amber-700 bg-amber-50 dark:bg-amber-900/10'
                }`}>
                  <div className="text-4xl mb-2">{scoreInfo.mastered ? '\u2705' : '\u{1F4AA}'}</div>
                  <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-gray-100">
                    {scoreInfo.earned}/{scoreInfo.total} points
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {scoreInfo.correct}/{scoreInfo.outOf} correct
                  </p>
                  <p className={`text-lg font-semibold mb-3 ${
                    scoreInfo.mastered ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {scoreInfo.mastered ? 'Topic Mastered!' : 'Not quite — review and try again'}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                    {scoreInfo.mastered
                      ? 'This topic has been removed from your list.'
                      : `You needed ${MASTERY_POINTS}/${TOTAL_POINTS} points. The harder problems are worth more because they prove deeper understanding.`}
                  </p>
                  <div className="flex gap-3 justify-center">
                    {scoreInfo.mastered ? (
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
              )}
            </>
          )}
        </div>
      </div>
    );
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
