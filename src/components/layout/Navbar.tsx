'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { FEATURES } from '@/lib/constants';
import { cn } from '@/lib/cn';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              StudyBoost
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {FEATURES.slice(0, 6).map((f) => (
              <Link
                key={f.id}
                href={f.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === f.href
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {f.name.split(' ')[0]}
              </Link>
            ))}
            <div className="relative group">
              <button className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                More
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {FEATURES.slice(6).map((f) => (
                  <Link
                    key={f.id}
                    href={f.href}
                    className={cn(
                      'block px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg',
                      pathname === f.href
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    {f.icon} {f.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="lg:hidden rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {FEATURES.map((f) => (
              <Link
                key={f.id}
                href={f.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === f.href
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {f.icon} {f.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
