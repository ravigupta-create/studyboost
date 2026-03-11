import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Library — StudyBoost',
  description: 'View and manage your saved quizzes, flashcards, summaries, and study materials.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
