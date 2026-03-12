'use client';

import { useState } from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { testApiKey } from '@/lib/gemini';

interface ApiKeySetupProps {
  onDone?: () => void;
}

export function ApiKeySetup({ onDone }: ApiKeySetupProps) {
  const { setApiKey, clearApiKey, hasKey } = useApiKey();
  const { addToast } = useToast();
  const [value, setValue] = useState(hasKey ? '••••••••••••••••' : '');
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '••••••••••••••••') {
      addToast('Please enter a valid API key.', 'error');
      return;
    }
    if (trimmed.length < 30 || trimmed.length > 60) {
      addToast("That doesn't look like a valid Gemini API key.", 'error');
      return;
    }

    setTesting(true);
    try {
      const valid = await testApiKey(trimmed);
      if (valid) {
        setApiKey(trimmed);
        addToast('API key verified and saved!', 'success');
        onDone?.();
      } else {
        addToast('API key is invalid. Please check and try again.', 'error');
      }
    } catch {
      addToast('Could not verify key. Saving anyway.', 'info');
      setApiKey(trimmed);
      onDone?.();
    } finally {
      setTesting(false);
    }
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
      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
        <p>Get your free key in 30 seconds:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>
            Go to{' '}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 dark:text-purple-400 underline font-medium"
            >
              aistudio.google.com/apikey
            </a>
          </li>
          <li>Sign in with your Google account (Gmail works)</li>
          <li>Click &quot;Create API key&quot;</li>
          <li>Copy the key and paste it below</li>
        </ol>
        <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Your key stays in your browser. Never sent to our servers.
        </p>
      </div>
      <Input
        type="text"
        placeholder="Paste your Gemini API key here"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        maxLength={100}
      />
      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1" disabled={testing}>
          {testing ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Verifying...
            </span>
          ) : (
            'Save Key'
          )}
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
