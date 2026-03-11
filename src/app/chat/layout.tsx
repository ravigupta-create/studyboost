import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Study Chat — StudyBoost',
  description: 'Chat with an AI tutor about any subject.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-[calc(100vh-8rem)]">
      {children}
    </div>
  );
}
