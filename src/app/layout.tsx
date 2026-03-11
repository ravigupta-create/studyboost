import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { ApiKeyProvider } from '@/context/ApiKeyContext';
import { ToastProvider } from '@/context/ToastContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ApiKeyBanner } from '@/components/layout/ApiKeyBanner';
import { ToastContainer } from '@/components/ui/ToastContainer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StudyBoost — Free AI Study Tools',
  description:
    'Free AI-powered study tools for high school students. Homework help, quiz generator, flashcards, note summarizer, math solver, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <ApiKeyProvider>
            <ToastProvider>
              <ApiKeyBanner />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <ToastContainer />
            </ToastProvider>
          </ApiKeyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
