import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://studyboost.vercel.app';
  const routes = ['', '/homework', '/quiz', '/flashcards', '/summarizer', '/math', '/essay', '/planner', '/pomodoro', '/gpa', '/citations', '/chat', '/vocab', '/practice', '/feedback', '/translate', '/formulas', '/wordcount', '/library'];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}
