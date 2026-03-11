'use client';

import { useState } from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ApiKeySetupProps {
  onDone?: () => void;
}

export function ApiKeySetup({ onDone }: ApiKeySetupProps) {
  const { apiKey, setApiKey, clearApiKey, hasKey } = useApiKey();
  const { addToast } = useToast();
  const [value, setValue] = useState(hasKey ? '••••••••••••••••' : '');

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '••••••••••••••••') {
      addToast('Please enter a valid API key.', 'error');
      return;
    }
    setApiKey(trimmed);
    addToast('API key saved!', 'success');
    onDone?.();
  };

  const handleClear = () => {
    clearApiKey();
    setValue('');
    addToast('API key removed.', 'info');
    onDone?.();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Gemini API Key
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Get your free API key from{' '}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 dark:text-purple-400 underline"
        >
          Google AI Studio
        </a>
        . Your key is stored locally and never sent to our servers.
      </p>
      <Input
        type="password"
        placeholder="Enter your Gemini API key"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
      />
      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1">
          Save Key
        </Button>
        {hasKey && (
          <Button variant="danger" onClick={handleClear}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
