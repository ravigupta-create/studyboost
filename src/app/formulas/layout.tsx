import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Formula Sheet — StudyBoost',
  description: 'Quick reference for math, physics, and chemistry formulas with LaTeX rendering.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="bg-white dark:bg-gray-900 min-h-[calc(100vh-8rem)]">{children}</div>;
}
