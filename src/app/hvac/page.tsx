import type { Metadata } from 'next';
import TradeLandingPage from '@/components/marketing/TradeLandingPage';
import { HVAC_PAGE } from '@/lib/marketing/trade-pages';

export const metadata: Metadata = {
  title: { absolute: HVAC_PAGE.metaTitle },
  description: HVAC_PAGE.description,
  alternates: { canonical: '/hvac' },
  openGraph: {
    title: HVAC_PAGE.metaTitle,
    description: HVAC_PAGE.description,
    url: '/hvac',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function HvacLandingPage() {
  return <TradeLandingPage page={HVAC_PAGE} />;
}
