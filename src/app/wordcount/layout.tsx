import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word Counter — StudyBoost',
  description: 'Count words, characters, sentences, and check readability for any text.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
