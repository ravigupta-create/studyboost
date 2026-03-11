import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pomodoro Timer — StudyBoost',
  description: 'Stay focused with a customizable Pomodoro timer. Track study sessions with work and break intervals.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
