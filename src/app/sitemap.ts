import type { MetadataRoute } from 'next';
import { BLOG_POSTS, latestPostDate } from '@/lib/blog/posts';

const SITE_URL = 'https://apex-ai-agent.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/signup`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/how-it-works`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    // Blog entries use real content dates, not build time.
    { url: `${SITE_URL}/blog`, lastModified: latestPostDate(), changeFrequency: 'weekly', priority: 0.6 },
    ...BLOG_POSTS.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.dateModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
