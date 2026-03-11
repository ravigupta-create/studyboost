import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flashcard Generator — StudyBoost',
  description: 'Generate flip-animated flashcard decks from any study material. AI-powered flashcard creation.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
