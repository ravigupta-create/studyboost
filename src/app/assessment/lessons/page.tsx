'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApiKey } from '@/hooks/useApiKey';
import { useAssessment } from '@/hooks/useAssessment';
import { useGeminiStream } from '@/hooks/useGemini';
import { lessonPrompt } from '@/lib/prompts';
import { COURSES, type Course, type Topic, type Unit } from '@/lib/curriculum';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

export default function LessonsPage() {
  const { hasKey } = useApiKey();
  const searchParams = useSearchParams();
  const { results, lessonProgress, markLessonComplete, markLessonViewed } = useAssessment();
  const { output, loading, generate, stop } = useGeminiStream();

  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('course') || COURSES[0].id);
  const [activeTopic, setActiveTopic] = useState<{ course: Course; unit: Unit; topic: Topic } | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const selectedCourse = useMemo(() => COURSES.find(c => c.id === selectedCourseId) || COURSES[0], [selectedCourseId]);

  // Get latest assessment result for selected course
  const latestResult = useMemo(() => {
    const courseResults = results.filter(r => r.courseId === selectedCourseId);
    return courseResults.length > 0 ? courseResults[courseResults.length - 1] : null;
  }, [results, selectedCourseId]);

  // Map unit scores
  const unitScoreMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (latestResult) {
      latestResult.unitScores.forEach(us => { map[us.unitId] = us.percentage; });
    }
    return map;
  }, [latestResult]);

  // Lesson completion map
  const completionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    lessonProgress.forEach(lp => { map[lp.topicId] = lp.completed; });
    return map;
  }, [lessonProgress]);

  const toggleUnit = useCallback((unitId: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  }, []);

  // Build flat list of all topics for prev/next navigation
  const allTopics = useMemo(() => {
    return selectedCourse.units.flatMap(unit =>
      unit.topics.map(topic => ({ course: selectedCourse, unit, topic }))
    );
  }, [selectedCourse]);

  const activeTopicIndex = useMemo(() => {
    if (!activeTopic) return -1;
    return allTopics.findIndex(t => t.topic.id === activeTopic.topic.id);
  }, [activeTopic, allTopics]);

  const startLesson = useCallback((course: Course, unit: Unit, topic: Topic) => {
    stop();
    setActiveTopic({ course, unit, topic });
    markLessonViewed(topic.id);
    generate(lessonPrompt(course.name, unit.name, topic.name, topic.description));
  }, [generate, stop, markLessonViewed]);

  const handlePrev = useCallback(() => {
    if (activeTopicIndex > 0) {
      const prev = allTopics[activeTopicIndex - 1];
      startLesson(prev.course, prev.unit, prev.topic);
    }
  }, [activeTopicIndex, allTopics, startLesson]);

  const handleNext = useCallback(() => {
    if (activeTopicIndex < allTopics.length - 1) {
      const next = allTopics[activeTopicIndex + 1];
      startLesson(next.course, next.unit, next.topic);
    }
  }, [activeTopicIndex, allTopics, startLesson]);

  // Auto-expand units with low scores
  useEffect(() => {
    if (latestResult) {
      const needsReview = new Set<string>();
      latestResult.unitScores.forEach(us => {
        if (us.percentage < 80) needsReview.add(us.unitId);
      });
      if (needsReview.size > 0) setExpandedUnits(needsReview);
    }
  }, [latestResult]);

  if (!hasKey) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PageHeader icon="&#x1F4D6;" title="Lessons" description="AI-generated lessons for your math topics." aiPowered />
        <Card><ApiKeySetup /></Card>
      </div>
    );
  }

  // Lesson View
  if (activeTopic) {
    const isComplete = completionMap[activeTopic.topic.id];
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
          {loading && !output && (
            <div className="text-center py-12">
              <Spinner className="h-8 w-8 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Generating lesson...</p>
            </div>
          )}
          {output && <MarkdownRenderer content={output} />}
          {loading && output && (
            <div className="flex justify-center mt-4">
              <Button variant="secondary" size="sm" onClick={stop}>Stop Generating</Button>
            </div>
          )}
        </Card>

        {!loading && output && (
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={activeTopicIndex <= 0} onClick={handlePrev}>
                &larr; Previous
              </Button>
              <Button variant="secondary" size="sm" disabled={activeTopicIndex >= allTopics.length - 1} onClick={handleNext}>
                Next &rarr;
              </Button>
            </div>
            <Button
              size="sm"
              onClick={() => markLessonComplete(activeTopic.topic.id)}
              disabled={isComplete}
              variant={isComplete ? 'secondary' : 'primary'}
            >
              {isComplete ? 'Completed' : 'Mark Complete'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Topic Overview
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader icon="&#x1F4D6;" title="Lessons" description="Review topics from your assessment. Focus on units that need improvement." aiPowered />

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
          <a href="/assessment" className="text-purple-600 dark:text-purple-400 font-medium hover:underline text-sm">
            Take an assessment first &rarr;
          </a>
        </Card>
      )}

      <div className="space-y-3">
        {selectedCourse.units.map(unit => {
          const score = unitScoreMap[unit.id];
          const isExpanded = expandedUnits.has(unit.id);
          const needsReview = score !== undefined && score < 80;
          const completedCount = unit.topics.filter(t => completionMap[t.id]).length;

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
                      {completedCount}/{unit.topics.length} lessons
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {needsReview && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium">
                      Needs Review
                    </span>
                  )}
                  {score !== undefined && (
                    <span className={`text-sm font-medium ${score >= 80 ? 'text-green-600 dark:text-green-400' : score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {score}%
                    </span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 space-y-2">
                  {unit.topics.map(topic => {
                    const isCompleted = completionMap[topic.id];
                    return (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${isCompleted ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}>
                            {isCompleted ? '\u2705' : '\u25CB'}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{topic.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{topic.description}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={needsReview && !isCompleted ? 'primary' : 'secondary'}
                          onClick={() => startLesson(selectedCourse, unit, topic)}
                        >
                          {isCompleted ? 'Review' : 'Start Lesson'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
