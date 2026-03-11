'use client';

import { useContext } from 'react';
import { ApiKeyContext } from '@/context/ApiKeyContext';

export function useApiKey() {
  return useContext(ApiKeyContext);
}
