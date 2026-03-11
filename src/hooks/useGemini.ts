'use client';

import { useState, useRef, useCallback } from 'react';
import { useApiKey } from './useApiKey';
import { useToast } from './useToast';
import { streamGemini, callGeminiJSON } from '@/lib/gemini';

export function useGeminiStream() {
  const { apiKey } = useApiKey();
  const { addToast } = useToast();
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (prompt: string) => {
      if (!apiKey) {
        addToast('Please set your Gemini API key first.', 'error');
        return '';
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setOutput('');
      try {
        const result = await streamGemini(apiKey, prompt, setOutput, controller.signal);
        return result;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return '';
        const msg = err instanceof Error ? err.message : 'An error occurred.';
        addToast(msg, 'error');
        return '';
      } finally {
        setLoading(false);
      }
    },
    [apiKey, addToast]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  return { output, loading, generate, stop };
}

export function useGeminiJSON<T>() {
  const { apiKey } = useApiKey();
  const { addToast } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (prompt: string) => {
      if (!apiKey) {
        addToast('Please set your Gemini API key first.', 'error');
        return null;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setData(null);
      try {
        const result = await callGeminiJSON<T>(apiKey, prompt, controller.signal);
        setData(result);
        return result;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return null;
        const msg = err instanceof Error ? err.message : 'An error occurred.';
        addToast(msg, 'error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiKey, addToast]
  );

  return { data, loading, generate };
}
