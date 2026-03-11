'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
