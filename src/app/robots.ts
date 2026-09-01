import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/pricing', '/signup', '/how-it-works', '/privacy', '/terms'],
      disallow: [
        '/login',
        '/forgot-password',
        '/reset-password',
        '/dashboard',
        '/dashboard/',
        '/api/',
      ],
    },
    sitemap: 'https://apex-ai-agent.com/sitemap.xml',
  };
}
