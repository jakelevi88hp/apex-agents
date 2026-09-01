import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    absolute: 'Page not found',
  },
  description: 'This page does not exist.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">404</p>
        <h1 className="text-4xl font-black mb-4">Page not found</h1>
        <p className="text-gray-400 mb-10 leading-relaxed">
          That URL does not exist. Head back home or see how the revenue engine works.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-semibold transition-all"
          >
            Go home
          </Link>
          <Link
            href="/how-it-works"
            className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 font-semibold transition-all"
          >
            How it works
          </Link>
        </div>
      </div>
    </div>
  );
}
