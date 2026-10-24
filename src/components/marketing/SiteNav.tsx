import Link from 'next/link';

/**
 * Public marketing site header, shared by the home page, /pricing, and /blog.
 * Markup is the original home page nav, with no-wrap added so the
 * logo and buttons stay on one line at 390px phone widths.
 * Section links use "/#..." so they work from any public page and still
 * scroll in place on the home page.
 */
export default function SiteNav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">A</div>
          <span className="text-lg font-bold tracking-tight whitespace-nowrap">Apex Agents</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="/#niches" className="hover:text-white transition-colors">Markets</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-2 sm:px-3 py-2 whitespace-nowrap">
            Sign In
          </Link>
          <Link href="/signup"
            className="text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors whitespace-nowrap">
            Get Started →
          </Link>
        </div>
      </div>
    </nav>
  );
}
