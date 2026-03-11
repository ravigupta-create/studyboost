'use client';

import { cn } from '@/lib/cn';
import { TextareaHTMLAttributes, forwardRef } from 'react';
import { MAX_INPUT_LENGTH } from '@/lib/constants';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCount, value, maxLength = MAX_INPUT_LENGTH, ...props }, ref) => {
    const len = typeof value === 'string' ? value.length : 0;
    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-y min-h-[120px]',
            className
          )}
          {...props}
        />
        {showCount && (
          <span className="absolute bottom-3 right-3 text-xs text-gray-400">
            {len.toLocaleString()}/{maxLength.toLocaleString()}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
