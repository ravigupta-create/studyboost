'use client';

import { useState, useMemo } from 'react';
import { FORMULA_CATEGORIES, FormulaCategory } from '@/lib/formulas';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { cn } from '@/lib/cn';

export default function FormulasPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    const query = search.toLowerCase().trim();

    return FORMULA_CATEGORIES.map((cat) => {
      // If a category filter is active and this isn't it, skip
      if (activeCategory && cat.name !== activeCategory) return null;

      const filteredFormulas = cat.formulas.filter((f) => {
        if (!query) return true;
        return (
          f.name.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query)
        );
      });

      if (filteredFormulas.length === 0) return null;

      return { ...cat, formulas: filteredFormulas };
    }).filter(Boolean) as FormulaCategory[];
  }, [search, activeCategory]);

  const handleCopy = async (formula: string) => {
    try {
      await navigator.clipboard.writeText(formula);
    } catch {
      // fallback: ignore
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        icon="📐"
        title="Formula Sheet"
        description="Quick reference for math, physics, and chemistry formulas."
        aiPowered={false}
      />

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search formulas by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
            activeCategory === null
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          )}
        >
          All
        </button>
        {FORMULA_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeCategory === cat.name
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Formula Cards */}
      {filteredCategories.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No formulas found matching your search.
          </p>
        </Card>
      ) : (
        filteredCategories.map((cat) => (
          <div key={cat.name} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span>{cat.icon}</span> {cat.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.formulas.map((f) => (
                <Card key={f.name} hover className="relative group">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {f.name}
                  </h3>
                  <div className="mb-3">
                    <MarkdownRenderer content={`$$${f.formula}$$`} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {f.description}
                  </p>
                  <button
                    onClick={() => handleCopy(f.formula)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Copy LaTeX"
                  >
                    Copy
                  </button>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
