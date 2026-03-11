'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { StudySession } from '@/types';

const STORAGE_KEY = 'sb-study-stats';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function useStudyStats() {
  const [sessions, setSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSessions(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const logSession = useCallback((feature: string, duration: number, score?: number) => {
    const session: StudySession = { date: todayStr(), feature, duration, score };
    setSessions(prev => {
      const next = [...prev, session].slice(-500); // keep last 500
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const stats = useMemo(() => {
    const today = todayStr();
    const week = new Date();
    week.setDate(week.getDate() - 7);
    const weekStr = week.toISOString().split('T')[0];

    const todaySessions = sessions.filter(s => s.date === today);
    const weekSessions = sessions.filter(s => s.date >= weekStr);

    const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const weekStudyTime = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    const todayStudyTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);

    const quizScores = sessions.filter(s => s.score !== undefined).map(s => s.score!);
    const avgScore = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;

    const streak = calculateStreak(sessions);

    const featureCounts: Record<string, number> = {};
    sessions.forEach(s => { featureCounts[s.feature] = (featureCounts[s.feature] || 0) + 1; });

    return {
      totalSessions: sessions.length,
      totalStudyTime,
      weekStudyTime,
      todayStudyTime,
      avgScore,
      streak,
      featureCounts,
      recentSessions: sessions.slice(-10).reverse(),
    };
  }, [sessions]);

  return { sessions, logSession, stats };
}

function calculateStreak(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = todayStr();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dates[0] !== today && dates[0] !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}
