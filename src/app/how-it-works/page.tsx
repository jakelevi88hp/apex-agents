import Link from 'next/link';

export const metadata = {
  title: 'How It Works',
  description:
    'How Apex Agents scouts local leads, scores them on 9 signals, writes outreach, and sends it on a schedule so you close.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How It Works | Apex Agents',
    url: 'https://apex-ai-agent.com/how-it-works',
  },
};

const steps = [
  {
    n: '01',
    title: 'Agents scout and score',
    body: 'Apex Agents continuously find local businesses in your target niche, enrich what is public about them, and score each lead so you only see the prospects worth a conversation.',
  },
  {
    n: '02',
    title: 'Outreach is written for that shop',
    body: 'The builder writes a pitch that references real local signals — rating, review volume, and obvious SEO gaps — instead of a mail-merge template.',
  },
  {
    n: '03',
    title: 'Publisher sends. You close.',
    body: 'Messages go out on a schedule. Replies land in your inbox. You step in when someone says yes. The engine keeps running.',
  },
];

const signals = [
  { title: 'Google rating', body: 'Star rating is a quick read on reputation and how hard a pitch has to work.' },
  { title: 'Review volume', body: 'Thin review counts often mean the shop is not running a review engine yet.' },
  { title: 'Review recency', body: 'Stale reviews are a gap a local competitor can fill.' },
  { title: 'Local SEO gaps', body: 'Missing or weak web presence is a reason they might want help, not a reason to skip them.' },
  { title: 'Niche fit', body: 'Only businesses you can actually serve get a high score.' },
  { title: 'Geography', body: 'Leads are weighted to the city and radius you actually cover.' },
  { title: 'Activity', body: 'A shop that looks open and active is worth more than a listing that looks abandoned.' },
  { title: 'Outreach overlap', body: 'We do not keep scoring the same dead lead as if it were new.' },
  { title: 'Conversion likelihood', body: 'The combined score is 0–200+ so you spend time on the top of the list, not the whole list.' },
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
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white px-3 py-2">Pricing</Link>
            <Link href="/signup" className="text-sm font-semibold px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500">
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-6 text-center">
        <p className="text-sm uppercase tracking-widest text-purple-300 mb-4">How it works</p>
        <h1 className="text-4xl md:text-6xl font-black mb-6">
          Three steps from zero to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">pipeline</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Apex Agents is an AI revenue engine for local businesses. It scouts, scores, writes, and sends. You close.
        </p>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="pl-6 border-l border-purple-500/30">
              <div className="text-5xl font-black text-purple-500/20 mb-3">{s.n}</div>
              <h2 className="text-xl font-bold mb-3">{s.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 border-t border-white/5 pt-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-center">The 9 lead-score signals</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Every prospect is scored 0–200+ so you are not guessing who to call. These are the signals the engine uses.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {signals.map((s, i) => (
              <div key={s.title} className="p-6 rounded-2xl border border-white/5 bg-white/[0.03]">
                <div className="text-xs text-purple-300 mb-2">Signal {i + 1}</div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center rounded-3xl border border-purple-500/20 bg-gray-900/80 p-12">
          <h2 className="text-3xl font-black mb-4">Built to run a real Indianapolis shop</h2>
          <p className="text-gray-400 mb-8">
            We built this stack to grow our own Indianapolis 24-hour shop. Founding users get the system we actually run — not a pitch deck.
          </p>
          <Link
            href="/signup"
            className="inline-flex px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold"
          >
            Start free today →
          </Link>
        </div>
      </section>
    </div>
  );
}
