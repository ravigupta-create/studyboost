export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              StudyBoost
            </span>{' '}
            — Free AI-powered study tools for students.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            100% free. Your data stays in your browser.
          </p>
        </div>
      </div>
    </footer>
  );
}
