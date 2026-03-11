'use client';

import { useState, useEffect } from 'react';
import { useGeminiJSON } from '@/hooks/useGemini';
import { useApiKey } from '@/hooks/useApiKey';
import { flashcardPrompt } from '@/lib/prompts';
import { Flashcard } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

export default function FlashcardsPage() {
  const { hasKey } = useApiKey();
  const { loading, generate } = useGeminiJSON<Flashcard[]>();
  const [text, setText] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Keyboard support for flashcard navigation
  useEffect(() => {
    if (cards.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setFlipped(false);
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setFlipped(false);
        setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards]);

  // Sync rawCards into local state when they arrive
  const handleGenerate = async () => {
    if (!text.trim()) return;
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);
    const result = await generate(flashcardPrompt(text));
    if (result) {
      setCards(result);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCards(shuffled);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
  };

  const handleReset = () => {
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);
    setText('');
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setFlipped((prev) => !prev);
    }
  };

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader
          icon="&#127183;"
          title="Flashcard Generator"
          description="Generate flip-animated flashcard decks from any study material."
          aiPowered
        />
        <Card>
          <ApiKeySetup />
        </Card>
      </div>
    );
  }

  // --- Input phase ---
  if (cards.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader
          icon="&#127183;"
          title="Flashcard Generator"
          description="Generate flip-animated flashcard decks from any study material."
          aiPowered
        />
        <Card>
          <Textarea
            placeholder="Paste your study notes here to generate flashcards..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            showCount
            disabled={loading}
          />
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleGenerate}
              disabled={loading || !text.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Generating Flashcards...
                </span>
              ) : (
                'Generate Flashcards'
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- Flashcard deck phase ---
  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="&#127183;"
        title="Flashcard Generator"
        description="Generate flip-animated flashcard decks from any study material."
        aiPowered
      />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {currentIndex + 1}/{cards.length}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleShuffle}>
            Shuffle
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {/* Flashcard with 3D flip */}
      <div
        className="perspective-1000 mb-6 cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped((prev) => !prev)}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard ${currentIndex + 1} of ${cards.length}. ${flipped ? 'Answer: ' + currentCard.back : 'Question: ' + currentCard.front}. Press Space or Enter to flip.`}
      >
        <div
          className="relative w-full min-h-[280px] transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 p-8 flex flex-col items-center justify-center shadow-lg"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-xs font-medium text-purple-500 dark:text-purple-400 uppercase tracking-wider mb-4">
              Question
            </span>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center leading-relaxed">
              {currentCard.front}
            </p>
            <span className="mt-6 text-xs text-gray-400 dark:text-gray-500">
              Click to flip
            </span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-8 flex flex-col items-center justify-center shadow-lg"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-4">
              Answer
            </span>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center leading-relaxed">
              {currentCard.back}
            </p>
            <span className="mt-6 text-xs text-gray-400 dark:text-gray-500">
              Click to flip back
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFlipped(false);
                setCurrentIndex(i);
              }}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === currentIndex
                  ? 'bg-purple-600'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to card ${i + 1}`}
            />
          ))}
        </div>

        <Button
          variant="secondary"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
