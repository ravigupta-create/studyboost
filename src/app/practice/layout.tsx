import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Practice Problems — StudyBoost',
  description: 'Generate AI-powered practice problems with hints and solutions for any subject.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-[calc(100vh-8rem)]">
      {children}
    </div>
  );
}
