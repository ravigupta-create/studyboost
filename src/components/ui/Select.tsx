import { cn } from '@/lib/cn';
import { SelectHTMLAttributes, forwardRef } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
