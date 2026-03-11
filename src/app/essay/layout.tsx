import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Essay Outline Generator — StudyBoost',
  description: 'Input a topic and get a structured, detailed essay outline. Free AI essay planning tool.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
