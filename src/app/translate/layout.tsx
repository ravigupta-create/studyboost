import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Language Translator — StudyBoost',
  description: 'Translate text to any language with AI-powered learning notes and vocabulary.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-[calc(100vh-8rem)]">
      {children}
    </div>
  );
}
