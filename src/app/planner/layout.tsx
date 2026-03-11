import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Study Planner — StudyBoost',
  description: 'Create a personalized weekly study schedule. Organize subjects, set priorities, and manage your time.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
