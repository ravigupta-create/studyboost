import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        404
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Page not found. It might have been moved or doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
      >
        Back to Home
      </Link>
    </div>
  );
}
