import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    absolute: 'How the AI Revenue Engine Works | Apex Agents',
  },
  description:
    'See how Apex Agents scouts local leads, scores them on 9 signals, and builds personalized outreach. Indianapolis-built system for local businesses.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How the AI Revenue Engine Works | Apex Agents',
    description:
      'See how Apex Agents scouts local leads, scores them on 9 signals, and builds personalized outreach.',
    url: '/how-it-works',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const steps = [
  {
    step: '01',
    title: 'Agents Scout & Score',
    desc: 'Configured agents continuously look for local businesses in your target niche and city. Each prospect is enriched with public listing data — rating, review history, category, and obvious gaps — then scored across nine signals so you only see the prospects worth a conversation.',
    detail:
      'Scouting is ongoing, not a one-time list dump. New businesses and changing listings flow into the same scoring pass, so the queue stays current without a weekly spreadsheet ritual.',
  },
  {
    step: '02',
    title: 'Personalized Outreach Builds',
    desc: 'The builder drafts a tailored pitch for each lead. Messages reference what is actually on the listing: star rating, review count, missing photos or hours, and local SEO gaps — not a mail-merge first name and a generic claim.',
    detail:
      'You stay in control. Review, edit, or hold a draft from the dashboard. The point is relevance: a shop with stale reviews hears a different note than a shop with no website at all.',
  },
  {
    step: '03',
    title: 'Publisher Sends. You Close.',
    desc: 'Approved outreach goes out on a schedule. Replies land where you already work. You step in when a prospect wants a conversation — the engine keeps scouting and scoring in the background.',
    detail:
      'Follow-ups are part of the same loop. Nothing relies on you remembering to nudge a lukewarm lead at 9 p.m. after a full day in the shop.',
  },
];

const signals = [
  {
    num: '1',
    title: 'Google rating',
    desc: 'Current star rating versus what customers in that category usually expect. A weak rating is a conversation; a strong one is a different offer.',
  },
  {
    num: '2',
    title: 'Review volume',
    desc: 'How many public reviews exist. A thin profile is a different opportunity than a busy listing that has gone quiet.',
  },
  {
    num: '3',
    title: 'Review recency',
    desc: 'Whether recent customers are still talking. Listings that went silent are often easier to help than ones already in a daily review cadence.',
  },
  {
    num: '4',
    title: 'Owner response rate',
    desc: 'If the business replies to reviews. Silence on public feedback is a signal they may not have a process — and may want one.',
  },
  {
    num: '5',
    title: 'Listing completeness',
    desc: 'Hours, photos, categories, and attributes. Incomplete Google Business profiles leak demand to whoever looks more finished.',
  },
  {
    num: '6',
    title: 'Website presence',
    desc: 'Whether there is a working site and the basics (contact, services, location). No site, or a site that does not match the listing, is scored as a gap.',
  },
  {
    num: '7',
    title: 'Local SEO gaps',
    desc: 'Name, address, and phone consistency plus obvious map-pack weaknesses. The outreach can name the gap instead of selling "SEO" in the abstract.',
  },
  {
    num: '8',
    title: 'Niche fit',
    desc: 'How closely the business matches the offer you actually sell. Scoring exists so tire-kickers outside your niche do not eat the queue.',
  },
  {
    num: '9',
    title: 'Opportunity window',
    desc: 'Competitive density and whether the listing looks neglected relative to nearby peers. High opportunity plus high fit rises to the top of the 0–200+ score.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">A</div>
            <span className="text-lg font-bold tracking-tight">Apex Agents</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/how-it-works" className="text-white">How It Works</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">How it works</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Scout. Score.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300">
              Outreach.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Apex Agents is an AI revenue engine for local businesses. Agents find prospects,
            score them on nine signals, and draft outreach you would actually send — so you
            spend time closing, not hunting.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Three steps from zero to a live queue</h2>
            <p className="text-gray-400 text-lg">The same loop we run for our Indianapolis 24-hour shop.</p>
          </div>
          <div className="space-y-10">
            {steps.map((item) => (
              <div key={item.step} className="relative pl-6 border-l border-purple-500/30 py-2">
                <div className="text-5xl font-black text-purple-500/20 mb-3">{item.step}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed mb-3">{item.desc}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Nine signals,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                one score
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Leads land on a 0–200+ scale. The nine inputs below are why the highest-value
              prospects rise and the rest stay out of your way.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signals.map((s) => (
              <div
                key={s.num}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-purple-500/20 transition-all"
              >
                <div className="text-sm font-bold text-purple-400 mb-2">Signal {s.num}</div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />
          <div className="relative rounded-3xl border border-purple-500/20 bg-gray-900/80 p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Founding users get the system we actually run
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
              This stack was built to run our Indianapolis 24-hour shop. Early access means
              the same scouting, scoring, and outreach loop — not a demo that diverges from production.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-lg transition-all shadow-lg shadow-purple-900/50"
              >
                Start free today →
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 font-semibold text-lg transition-all"
              >
                View pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">A</div>
            <span className="font-bold">Apex Agents</span>
          </Link>
          <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} Apex Advantage. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
