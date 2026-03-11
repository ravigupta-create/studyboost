'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 p-6 animate-slide-up',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
