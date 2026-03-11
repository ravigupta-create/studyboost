import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Homework Explainer — StudyBoost',
  description: 'Paste any homework question and get a clear, step-by-step AI explanation. Free homework help.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
