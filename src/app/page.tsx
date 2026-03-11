'use client';

import { useState } from 'react';
import { FEATURES } from '@/lib/constants';
import { FeatureCard } from '@/components/shared/FeatureCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';
import { useApiKey } from '@/hooks/useApiKey';
import { useStudyStats } from '@/hooks/useStudyStats';
import { useLibrary } from '@/hooks/useLibrary';
import { formatDuration } from '@/lib/export';

export default function HomePage() {
  const { hasKey } = useApiKey();
  const [showKey, setShowKey] = useState(false);
  const { stats } = useStudyStats();
  const { items } = useLibrary();
  const [filter, setFilter] = useState<'all' | 'ai' | 'offline'>('all');

  const aiFeatures = FEATURES.filter(f => f.aiPowered);
  const offlineFeatures = FEATURES.filter(f => !f.aiPowered);
  const filtered = filter === 'all' ? FEATURES : filter === 'ai' ? aiFeatures : offlineFeatures;

  const hasStats = stats.totalSessions > 0;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Study Smarter
            </span>
            <br />
            <span className="text-gray-900 dark:text-gray-100">Not Harder</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {FEATURES.length} powerful study tools — {aiFeatures.length} AI-powered, {offlineFeatures.length} offline.
            Generate quizzes, flashcards, summaries, chat with a tutor, and more. 100% free, forever.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => setShowKey(true)}>
              {hasKey ? 'Update API Key' : 'Get Started — Add API Key'}
            </Button>
            <a href="#features">
              <Button size="lg" variant="secondary">
                Explore Tools
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Study Stats Dashboard */}
      {hasStats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Your Study Dashboard
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="text-center py-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.streak}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Day Streak</div>
            </Card>
            <Card className="text-center py-4">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatDuration(stats.weekStudyTime)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">This Week</div>
            </Card>
            <Card className="text-center py-4">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.totalSessions}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Sessions</div>
            </Card>
            <Card className="text-center py-4">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {items.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Saved Items</div>
            </Card>
          </div>
        </section>
      )}

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            All Your Study Tools in One Place
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            AI features require a free Gemini API key. Offline tools work instantly.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            {(['all', 'ai', 'offline'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f === 'all' ? `All (${FEATURES.length})` : f === 'ai' ? `AI-Powered (${aiFeatures.length})` : `Offline (${offlineFeatures.length})`}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Get a Free API Key', desc: 'Go to aistudio.google.com/apikey and create your free Gemini API key in 30 seconds.' },
              { step: '2', title: 'Add Your Key', desc: 'Paste your key into StudyBoost. It stays in your browser — never sent to any server.' },
              { step: '3', title: 'Start Studying', desc: `Use any of our ${FEATURES.length} tools. AI features stream results in real-time. Offline tools work instantly.` },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Modal open={showKey} onClose={() => setShowKey(false)}>
        <ApiKeySetup onDone={() => setShowKey(false)} />
      </Modal>
    </div>
  );
}
