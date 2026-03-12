'use client';

import { useState, useEffect, useCallback } from 'react';

const PASSWORD = 'srg213';
const MAX_ATTEMPTS = 4;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes
const LOCKOUT_KEY = 'sb-lockout';

function getLockoutExpiry(): number {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function setLockoutExpiry(ts: number) {
  try {
    localStorage.setItem(LOCKOUT_KEY, ts.toString());
  } catch {
    // storage full or unavailable
  }
}

function clearLockout() {
  try {
    localStorage.removeItem(LOCKOUT_KEY);
  } catch {
    // ignore
  }
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // On mount, check for existing lockout
  useEffect(() => {
    const expiry = getLockoutExpiry();
    if (expiry > Date.now()) {
      setLockoutEnd(expiry);
    } else if (expiry > 0) {
      clearLockout();
    }
    setMounted(true);
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutEnd <= 0) return;
    const tick = () => {
      const left = lockoutEnd - Date.now();
      if (left <= 0) {
        setLockoutEnd(0);
        setRemaining(0);
        setAttempts(0);
        setError('');
        clearLockout();
      } else {
        setRemaining(Math.ceil(left / 1000));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockoutEnd]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (lockoutEnd > Date.now()) return;

      if (input === PASSWORD) {
        setAuthenticated(true);
        setError('');
        clearLockout();
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setInput('');
        if (next >= MAX_ATTEMPTS) {
          const expiry = Date.now() + LOCKOUT_MS;
          setLockoutEnd(expiry);
          setLockoutExpiry(expiry);
          setError('Too many failed attempts. Locked out for 5 minutes.');
        } else {
          setError(`Incorrect password. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? '' : 's'} remaining.`);
        }
      }
    },
    [input, attempts, lockoutEnd]
  );

  // Don't render anything until mounted (avoid hydration mismatch)
  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  if (authenticated) {
    return <>{children}</>;
  }

  const isLocked = lockoutEnd > Date.now();
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              StudyBoost
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter the password to continue
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit}>
            <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Access Code
            </label>
            <input
              id="auth-password"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLocked}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              placeholder={isLocked ? 'Locked' : 'Enter access code'}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
            {error && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            {isLocked && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium tabular-nums">
                    {mins}:{secs.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={isLocked || !input.trim()}
              className="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLocked ? 'Locked Out' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
