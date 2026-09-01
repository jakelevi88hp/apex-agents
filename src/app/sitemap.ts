import type { MetadataRoute } from 'next';

const SITE_URL = 'https://apex-ai-agent.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/pricing', '/signup', '/how-it-works', '/privacy', '/terms'];
  return paths.map((path) => ({
    url: `${SITE_URL}${path || '/'}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }));
}
