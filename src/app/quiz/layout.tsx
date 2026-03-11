import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiz Generator — StudyBoost',
  description: 'Turn your study notes into interactive quiz questions with instant scoring. AI-powered quiz generation.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
