interface PageHeaderProps {
  icon: string;
  title: string;
  description: string;
  aiPowered?: boolean;
}

export function PageHeader({ icon, title, description, aiPowered }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {aiPowered && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            AI
          </span>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
