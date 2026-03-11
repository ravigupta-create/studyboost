import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vocabulary Builder — StudyBoost',
  description: 'Extract and learn vocabulary words from any text with AI-powered definitions and examples.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-[calc(100vh-8rem)]">
      {children}
    </div>
  );
}
