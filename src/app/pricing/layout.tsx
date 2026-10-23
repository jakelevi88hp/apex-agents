import type { Metadata } from 'next';
import Script from 'next/script';
import { PRICING_FAQS, pricingFaqAnswerText } from '@/lib/marketing/pricing-faq';

const SITE_URL = 'https://apex-ai-agent.com';

export const metadata: Metadata = {
  title: 'Local Business AI Agent Pricing | Apex Agents',
  description:
    'Plans for the Apex Agents AI revenue engine: scout leads, 9-signal scoring, and personalized outreach for local businesses.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Local Business AI Agent Pricing | Apex Agents',
    description:
      'Plans for the Apex Agents AI revenue engine: scout leads, 9-signal scoring, and personalized outreach for local businesses.',
    url: '/pricing',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PRICING_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: pricingFaqAnswerText(faq),
    },
  })),
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="pricing-faq-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
