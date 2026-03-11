import Link from 'next/link';
import { Feature } from '@/types';
import { cn } from '@/lib/cn';

export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Link href={feature.href}>
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <div
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br',
            feature.color
          )}
        />
        <div className="relative">
          <span className="text-3xl">{feature.icon}</span>
          <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {feature.name}
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {feature.description}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {feature.aiPowered && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                AI-Powered
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {feature.aiPowered ? 'Requires API key' : 'Works offline'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
