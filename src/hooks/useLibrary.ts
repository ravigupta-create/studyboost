'use client';

import { useState, useCallback, useEffect } from 'react';
import { SavedDeck } from '@/types';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'sb-library';

export function useLibrary() {
  const [items, setItems] = useState<SavedDeck[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const save = useCallback((name: string, type: SavedDeck['type'], data: unknown) => {
    const item: SavedDeck = { id: generateId(), name, type, createdAt: Date.now(), data };
    setItems(prev => {
      const next = [item, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return item.id;
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const get = useCallback((id: string) => items.find(i => i.id === id) || null, [items]);

  const getByType = useCallback((type: SavedDeck['type']) => items.filter(i => i.type === type), [items]);

  return { items, save, remove, get, getByType };
}
