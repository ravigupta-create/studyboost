import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assessment Mode — StudyBoost',
  description: 'Take a diagnostic math assessment and get personalized AI lessons for topics you need to master.',
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
