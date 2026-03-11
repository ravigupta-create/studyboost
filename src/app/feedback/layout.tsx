import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Writing Feedback — StudyBoost',
  description: 'Get constructive AI-powered feedback on your essays and writing assignments.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-[calc(100vh-8rem)]">
      {children}
    </div>
  );
}
