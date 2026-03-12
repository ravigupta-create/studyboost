'use client';

import { useState, useCallback, useEffect } from 'react';
import { AssessmentResult, LessonProgress } from '@/types';

const STORAGE_KEY = 'sb-assessment';
const MAX_RESULTS_PER_COURSE = 10;

interface AssessmentData {
  results: AssessmentResult[];
  lessonProgress: LessonProgress[];
}

function load(): AssessmentData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { results: [], lessonProgress: [] };
}

function save(data: AssessmentData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useAssessment() {
  const [data, setData] = useState<AssessmentData>({ results: [], lessonProgress: [] });

  useEffect(() => {
    setData(load());
  }, []);

  const saveResult = useCallback((result: AssessmentResult) => {
    setData(prev => {
      const otherResults = prev.results.filter(r => r.courseId !== result.courseId);
      const courseResults = prev.results.filter(r => r.courseId === result.courseId);
      courseResults.push(result);
      const trimmed = courseResults.slice(-MAX_RESULTS_PER_COURSE);
      const next = { ...prev, results: [...otherResults, ...trimmed] };
      save(next);
      return next;
    });
  }, []);

  const markLessonComplete = useCallback((topicId: string) => {
    setData(prev => {
      const existing = prev.lessonProgress.filter(lp => lp.topicId !== topicId);
      existing.push({ topicId, completed: true, lastViewed: new Date().toISOString() });
      const next = { ...prev, lessonProgress: existing };
      save(next);
      return next;
    });
  }, []);

  const markLessonViewed = useCallback((topicId: string) => {
    setData(prev => {
      const idx = prev.lessonProgress.findIndex(lp => lp.topicId === topicId);
      if (idx >= 0 && prev.lessonProgress[idx].completed) return prev;
      const updated = prev.lessonProgress.filter(lp => lp.topicId !== topicId);
      updated.push({ topicId, completed: false, lastViewed: new Date().toISOString() });
      const next = { ...prev, lessonProgress: updated };
      save(next);
      return next;
    });
  }, []);

  const getResults = useCallback((courseId: string) => {
    return data.results.filter(r => r.courseId === courseId);
  }, [data.results]);

  return {
    results: data.results,
    lessonProgress: data.lessonProgress,
    saveResult,
    markLessonComplete,
    markLessonViewed,
    getResults,
  };
}
