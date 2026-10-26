import Link from 'next/link';

/** Public marketing footer used by the blog (same markup as /how-it-works). */
export default function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">A</div>
          <span className="font-bold">Apex Agents</span>
        </Link>
        <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} Apex Advantage. All rights reserved.</p>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <Link href="/hvac" className="hover:text-white transition-colors">HVAC</Link>
          <Link href="/auto" className="hover:text-white transition-colors">Auto Shops</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
        </div>
      </div>
    </footer>
  );
}
