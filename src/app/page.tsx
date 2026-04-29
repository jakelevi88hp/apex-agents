import Link from 'next/link';

// ── Feature card data ──────────────────────────────────────────────────────────
const features = [
  {
    icon: '🤖',
    title: 'Autonomous AI Agents',
    desc: 'Deploy intelligent agents that prospect, research, and engage leads around the clock — no manual work required.',
  },
  {
    icon: '📍',
    title: 'Local Market Domination',
    desc: 'Built for local businesses. Our agents understand your market, your niche, and your city — not generic fluff.',
  },
  {
    icon: '⭐',
    title: 'Google Review Engine',
    desc: 'Automatically identify, score, and reach the right prospects with a proven review and local SEO acquisition system.',
  },
  {
    icon: '📊',
    title: 'Live Revenue Tracking',
    desc: 'See exactly what your pipeline looks like in real time. Every lead scored, every outreach tracked, every dollar visible.',
  },
  {
    icon: '🎯',
    title: 'Precision Lead Scoring',
    desc: 'Leads scored 0–200+ across 9 signals. Only your highest-value prospects get your time and your pitch.',
  },
  {
    icon: '⚡',
    title: 'Always-On Automation',
    desc: 'Scout, scrape, build, and publish — on a schedule. Your revenue engine runs while you sleep.',
  },
];

// ── Social proof numbers ────────────────────────────────────────────────────────
const stats = [
  { value: '147+', label: 'Leads Normalized' },
  { value: '5', label: 'Active AI Agents' },
  { value: '4', label: 'Live Niches' },
  { value: '91', label: 'High-Priority Prospects' },
];

// ── Niche pills ─────────────────────────────────────────────────────────────────
const niches = ['Law Firms', 'HVAC Contractors', 'Dental Clinics', 'Auto Repair', 'Local SEO', 'Google Reviews'];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">A</div>
            <span className="text-lg font-bold tracking-tight">Apex Agents</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#niches" className="hover:text-white transition-colors">Markets</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link href="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors">
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none"/>
        <div className="absolute top-40 left-1/3 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none"/>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            Revenue Engine — Live & Running
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            Your Business.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300">
              On Autopilot.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Apex Agents is an AI-powered revenue system for local businesses.
            It scouts leads, scores prospects, writes outreach, and tracks results —
            while you focus on closing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-lg transition-all shadow-lg shadow-purple-900/50">
              Start Free Today →
            </Link>
            <a href="#how-it-works"
              className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 font-semibold text-lg transition-all">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────── */}
      <section className="py-12 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {s.value}
              </div>
              <div className="text-sm text-gray-500 mt-1 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything You Need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Win Locally
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              One system. Five agents. Unlimited reach. Built for the businesses that want to grow without hiring a full sales team.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-purple-500/20 transition-all"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three steps from zero to revenue.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Agents Scout & Score', desc: 'Our AI agents continuously find local businesses in your target niche, enrich their data, and score each lead across 9 signals — so you only see the best prospects.' },
              { step: '02', title: 'Personalized Outreach Builds', desc: 'The Builder agent crafts a tailored pitch for each lead — referencing their real Google rating, review count, and local SEO gaps. Every message lands like it was written by hand.' },
              { step: '03', title: 'Publisher Sends. You Close.', desc: 'Outreach goes out on schedule. Replies land in your inbox. You step in only when a prospect says yes. The engine never stops running.' },
            ].map((item) => (
              <div key={item.step} className="relative pl-6 border-l border-purple-500/30">
                <div className="text-5xl font-black text-purple-500/20 mb-3">{item.step}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Niches ────────────────────────────────────────────────────── */}
      <section id="niches" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Built for Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Market
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto">
            Apex Agents is pre-tuned for the highest-value local business niches — with niche-specific scripts, scoring, and outreach.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {niches.map((niche) => (
              <span
                key={niche}
                className="px-5 py-2.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-200 text-sm font-medium"
              >
                {niche}
              </span>
            ))}
          </div>
          <p className="text-gray-600 text-sm mt-8">More niches added every quarter.</p>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl"/>
          <div className="relative rounded-3xl border border-purple-500/20 bg-gray-900/80 p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ready to Put Your<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Revenue on Autopilot?
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
              Join local business owners using Apex Agents to find more leads, send better outreach, and close more deals — without adding headcount.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-lg transition-all shadow-lg shadow-purple-900/50">
                Get Started Free &rarr;
              </Link>
              <Link href="/login"
                className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 font-semibold text-lg transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">A</div>
            <span className="font-bold">Apex Agents</span>
          </div>
          <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} Apex Advantage. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
