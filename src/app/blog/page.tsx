import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/marketing/SiteNav';
import SiteFooter from '@/components/marketing/SiteFooter';
import { getAllPosts } from '@/lib/blog/posts';

const DESCRIPTION =
  'Practical guides for Indianapolis HVAC, auto repair, and trades businesses on finding commercial customers and following up without a sales team.';

export const metadata: Metadata = {
  title: { absolute: 'Blog: Winning Local Commercial Customers | Apex Agents' },
  description: DESCRIPTION,
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog: Winning Local Commercial Customers | Apex Agents',
    description: DESCRIPTION,
    url: '/blog',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />
      <section className="pt-32 pb-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">Blog</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Winning local commercial customers
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">{DESCRIPTION}</p>
        </div>
      </section>
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-purple-500/20 transition-all"
            >
              <time dateTime={post.datePublished} className="text-sm text-gray-500">
                {formatDate(post.datePublished)}
              </time>
              <h2 className="text-2xl font-bold mt-2 mb-3">
                <Link href={`/blog/${post.slug}`} className="hover:text-purple-300 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-400 leading-relaxed">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
