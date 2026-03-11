import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GPA Calculator — StudyBoost',
  description: 'Calculate your GPA with support for honors and AP weighting. Free GPA calculator for students.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
