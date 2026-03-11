import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Note Summarizer — StudyBoost',
  description: 'Condense long notes into concise, organized bullet-point summaries. Free AI-powered note summarization.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
