'use client';

import { useState } from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

export function ApiKeyBanner() {
  const { hasKey } = useApiKey();
  const [showModal, setShowModal] = useState(false);

  if (hasKey) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <p className="text-sm">
            Add your free Gemini API key to unlock AI-powered features.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => setShowModal(true)}
          >
            Add Key
          </Button>
        </div>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ApiKeySetup onDone={() => setShowModal(false)} />
      </Modal>
    </>
  );
}
