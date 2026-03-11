export interface Feature {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  aiPowered: boolean;
  color: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface PlannerEntry {
  subject: string;
  day: string;
  startHour: number;
  duration: number;
  color: string;
}

export interface PlannerSubject {
  name: string;
  hoursPerWeek: number;
  priority: 'high' | 'medium' | 'low';
  testDate?: string;
}

export interface GpaEntry {
  course: string;
  grade: string;
  credits: number;
  isHonors: boolean;
  isAP: boolean;
}

export interface Citation {
  type: 'book' | 'website' | 'journal' | 'article';
  authors: string;
  title: string;
  year: string;
  publisher?: string;
  url?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  accessDate?: string;
}

export type CitationStyle = 'mla' | 'apa' | 'chicago';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLong: number;
}
