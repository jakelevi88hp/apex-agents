import type { Metadata } from 'next';
import TradeLandingPage from '@/components/marketing/TradeLandingPage';
import { AUTO_PAGE } from '@/lib/marketing/trade-pages';

export const metadata: Metadata = {
  title: { absolute: AUTO_PAGE.metaTitle },
  description: AUTO_PAGE.description,
  alternates: { canonical: '/auto' },
  openGraph: {
    title: AUTO_PAGE.metaTitle,
    description: AUTO_PAGE.description,
    url: '/auto',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function AutoLandingPage() {
  return <TradeLandingPage page={AUTO_PAGE} />;
}
