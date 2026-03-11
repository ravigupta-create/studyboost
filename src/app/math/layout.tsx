import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Math Problem Solver — StudyBoost',
  description: 'Get step-by-step solutions for algebra, calculus, and more. Free AI math problem solver.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
