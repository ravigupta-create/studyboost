'use client';

import { useState, useMemo } from 'react';
import { useLibrary } from '@/hooks/useLibrary';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import { SavedDeck } from '@/types';
import { useToast } from '@/hooks/useToast';

type FilterType = 'all' | 'quiz' | 'flashcards' | 'summary' | 'chat';

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'quiz', label: 'Quizzes' },
  { value: 'flashcards', label: 'Flashcards' },
  { value: 'summary', label: 'Summaries' },
  { value: 'chat', label: 'Chats' },
];

const TYPE_META: Record<SavedDeck['type'], { icon: string; badge: string; color: string }> = {
  quiz: { icon: '❓', badge: 'Quiz', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  flashcards: { icon: '🃏', badge: 'Flashcards', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  summary: { icon: '📝', badge: 'Summary', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  chat: { icon: '💬', badge: 'Chat', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function LibraryPage() {
  const { items, remove } = useLibrary();
  const { addToast } = useToast();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();
    return items.filter((item) => {
      if (filter !== 'all' && item.type !== filter) return false;
      if (query && !item.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, filter, search]);

  const handleOpen = async (item: SavedDeck) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(item.data, null, 2));
      addToast('Content copied! Paste it in the tool to use.', 'success');
    } catch {
      addToast('Failed to copy content.', 'error');
    }
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      remove(id);
      setConfirmDeleteId(null);
      addToast('Item deleted.', 'info');
    } else {
      setConfirmDeleteId(id);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmDeleteId((prev) => (prev === id ? null : prev)), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        icon="📚"
        title="My Library"
        description="Your saved quizzes, flashcards, and study materials."
        aiPowered={false}
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              filter === tab.value
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search saved items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-4xl mb-4">✨</p>
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No saved items yet.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate quizzes, flashcards, or summaries and save them here!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const meta = TYPE_META[item.type];
            return (
              <Card key={item.id} hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.icon}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        meta.color
                      )}
                    >
                      {meta.badge}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 line-clamp-2">
                  {item.name}
                </h3>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleOpen(item)}>
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant={confirmDeleteId === item.id ? 'danger' : 'ghost'}
                    onClick={() => handleDelete(item.id)}
                  >
                    {confirmDeleteId === item.id ? 'Confirm?' : 'Delete'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
