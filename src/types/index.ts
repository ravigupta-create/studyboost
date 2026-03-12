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

export interface SavedDeck {
  id: string;
  name: string;
  type: 'quiz' | 'flashcards' | 'summary' | 'chat';
  createdAt: number;
  data: unknown;
}

export interface StudySession {
  date: string; // YYYY-MM-DD
  feature: string;
  duration: number; // seconds
  score?: number; // 0-100 for quizzes
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface VocabWord {
  word: string;
  definition: string;
  partOfSpeech: string;
  example: string;
}

export interface PracticeProblem {
  problem: string;
  hint: string;
  solution: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AssessmentQuestion {
  unitId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UnitScore {
  unitId: string;
  unitName: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface AssessmentResult {
  courseId: string;
  date: string;
  unitScores: UnitScore[];
  overallPercentage: number;
  questions: AssessmentQuestion[];
  answers: Record<number, number>; // -1 = "I don't know this yet"
}

export interface LessonProblem {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  solution: string;
}

export interface PausedAssessment {
  courseId: string;
  questions: AssessmentQuestion[];
  currentIndex: number;
  answers: Record<number, number>;
  startTime: number;
}

export interface LessonProgress {
  topicId: string;
  completed: boolean;
  lastViewed: string;
}
