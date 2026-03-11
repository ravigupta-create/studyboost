'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    localStorage.removeItem(key);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, hydrated] as const;
}
