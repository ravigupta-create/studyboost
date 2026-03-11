'use client';

import { createContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  hasKey: boolean;
}

export const ApiKeyContext = createContext<ApiKeyContextType>({
  apiKey: '',
  setApiKey: () => {},
  clearApiKey: () => {},
  hasKey: false,
});

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey, clearApiKey] = useLocalStorage('sb-gemini-key', '');

  return (
    <ApiKeyContext.Provider
      value={{ apiKey, setApiKey, clearApiKey, hasKey: apiKey.length > 0 }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}
