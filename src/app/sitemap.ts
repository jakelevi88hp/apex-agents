import type { MetadataRoute } from 'next';
import { BLOG_POSTS, latestPostDate } from '@/lib/blog/posts';

const SITE_URL = 'https://apex-ai-agent.com';

// Fixed content dates (last commit touching each page, per git log), not build
// time. A lastmod that changes on every deploy tells crawlers nothing.
// Update the date when a page's content actually changes.
const PAGE_LAST_MODIFIED = {
  home: '2026-10-24', // 1c87f34 src/app/page.tsx
  pricing: '2026-10-26', // pricing trial line next to Premium
  signup: '2026-10-24', // a43d0ff src/app/signup
  howItWorks: '2026-10-26', // trade page links added
  privacy: '2026-10-18', // ac175a2 src/app/privacy
  terms: '2026-09-01', // f319a69 src/app/terms
  hvac: '2026-10-26', // src/app/hvac first published
  auto: '2026-10-26', // src/app/auto first published
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: PAGE_LAST_MODIFIED.home, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified: PAGE_LAST_MODIFIED.pricing, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/signup`, lastModified: PAGE_LAST_MODIFIED.signup, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/how-it-works`, lastModified: PAGE_LAST_MODIFIED.howItWorks, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/hvac`, lastModified: PAGE_LAST_MODIFIED.hvac, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/auto`, lastModified: PAGE_LAST_MODIFIED.auto, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/privacy`, lastModified: PAGE_LAST_MODIFIED.privacy, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: PAGE_LAST_MODIFIED.terms, changeFrequency: 'yearly', priority: 0.3 },
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
