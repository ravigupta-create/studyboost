import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Citation Generator — StudyBoost',
  description: 'Generate properly formatted citations in MLA, APA, and Chicago styles. Free citation tool for students.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
