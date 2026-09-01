import Link from 'next/link';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">404</p>
      <h1 className="text-4xl font-black mb-4">This page could not be found.</h1>
      <p className="text-gray-400 mb-8 max-w-md">
        The page you requested is not on Apex Agents. Try the homepage or see how the revenue engine works.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold"
        >
          Go home
        </Link>
        <Link
          href="/how-it-works"
          className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 font-semibold"
        >
          How it works
        </Link>
      </div>
    </div>
  );
}
