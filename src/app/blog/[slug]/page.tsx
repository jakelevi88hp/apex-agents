import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/marketing/SiteNav';
import SiteFooter from '@/components/marketing/SiteFooter';
import BlogText from '@/components/marketing/BlogText';
import { BLOG_POSTS, getPostBySlug, type BlogBlock } from '@/lib/blog/posts';

const SITE_URL = 'https://apex-ai-agent.com';

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  const path = `/blog/${post.slug}`;
  return {
    title: { absolute: post.metaTitle },
    description: post.description,
    alternates: { canonical: path },
    openGraph: {
      title: post.title,
      description: post.description,
      url: path,
      type: 'article',
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
    },
    robots: { index: true, follow: true },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-4">{block.text}</h2>;
    case 'p':
      return (
        <p className="text-gray-300 leading-relaxed mb-5">
          <BlogText text={block.text} />
        </p>
      );
    case 'ul':
      return (
        <ul className="list-disc pl-6 space-y-2 text-gray-300 leading-relaxed mb-5">
          {block.items.map((item) => (
            <li key={item}>
              <BlogText text={item} />
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal pl-6 space-y-2 text-gray-300 leading-relaxed mb-5">
          {block.items.map((item) => (
            <li key={item}>
              <BlogText text={item} />
            </li>
          ))}
        </ol>
      );
    case 'example':
      return (
        <figure className="my-6 rounded-2xl border border-purple-500/20 bg-white/[0.03] p-6">
          <figcaption className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-4">
            {block.label}
          </figcaption>
          <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
            {block.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </figure>
      );
    default:
      return null;
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.datePublished,
        dateModified: post.dateModified,
        mainEntityOfPage: url,
        url,
        author: { '@type': 'Organization', name: 'Apex Agents', url: SITE_URL },
        publisher: { '@type': 'Organization', name: 'Apex Agents', url: SITE_URL },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Script
        id="blog-post-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />
      <article className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-white">Blog</Link>
          </nav>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{post.title}</h1>
          <p className="text-sm text-gray-500 mb-10">
            Published <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
          </p>
          {post.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>
      </article>
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />
          <div className="relative rounded-3xl border border-purple-500/20 bg-gray-900/80 p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-4">Let agents handle the prospecting</h2>
            <p className="text-gray-400 mb-8">
              Scout, score, and draft outreach you approve. 3-day free trial, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={post.ctaHref}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-lg transition-all shadow-lg shadow-purple-900/50"
              >
                Start your free trial →
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 font-semibold text-lg transition-all"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
