'use client';

import Link from 'next/link';
import { useState } from 'react';

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
  { value: '24/7', label: 'Autonomous Operation' },
  { value: '5', label: 'Active AI Agents' },
  { value: '30+', label: 'Supported Niches' },
  { value: '9', label: 'Lead Score Signals' },
];

// ── Niche pills ─────────────────────────────────────────────────────────────────
const nicheCategories = [
  {
    label: 'Legal & Finance',
    niches: ['Law Firms', 'Accountants / CPAs', 'Insurance Agents', 'Financial Advisors', 'Mortgage Brokers'],
  },
  {
    label: 'Home Services',
    niches: ['HVAC Contractors', 'Plumbing', 'Roofing', 'Electricians', 'Landscaping', 'Pest Control', 'Pool Service', 'Painting / Remodeling'],
  },
  {
    label: 'Health & Wellness',
    niches: ['Dental Clinics', 'Chiropractors', 'Physical Therapy', 'Med Spas', 'Optometry', 'Veterinarians'],
  },
  {
    label: 'Automotive',
    niches: ['Auto Repair Shops', 'Auto Detailing', 'Tire Shops', 'Towing Services'],
  },
  {
    label: 'Beauty & Personal Care',
    niches: ['Hair Salons', 'Barbershops', 'Nail Salons', 'Tattoo Studios', 'Spas & Massage'],
  },
  {
    label: 'Professional Services',
    niches: ['Real Estate Agents', 'Property Management', 'Staffing Agencies', 'IT & Tech Support'],
  },
  {
    label: 'Food & Hospitality',
    niches: ['Restaurants', 'Catering Services', 'Food Trucks', 'Bakeries', 'Coffee Shops'],
  },
];

// ── FAQ data ────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'Is this really fully automated?',
    a: 'Yes. Once your agent is configured, it runs on its own — scouting leads from Google Maps and review sites, scoring them against 9 signals, and sending personalized outreach without you lifting a finger. You get a daily summary and can approve or adjust anything from your dashboard.',
  },
  {
    q: 'How long until I see results?',
    a: 'Most clients see their first qualified leads engaged within 48 hours of setup. Meaningful pipeline activity — replies, booked calls, review requests fulfilled — typically shows up in the first 1–2 weeks.',
  },
  {
    q: 'What niches do you support?',
    a: 'We support 30+ local business types including auto repair, dental, HVAC, law firms, roofing, landscaping, med spas, and more. If your business serves local customers, there\'s almost certainly an agent configuration for you. Check the niches section above or reach out and we\'ll confirm your fit.',
  },
  {
    q: 'How is this different from a chatbot?',
    a: 'Chatbots react — they sit on your site and wait. Apex Agents are proactive. They go out and find leads, score them by conversion likelihood, and initiate outreach on your behalf. Think of it as an AI sales rep, not a support widget.',
  },
  {
    q: 'Do I need to be technical to set this up?',
    a: 'Not at all. Onboarding takes about 15 minutes — you answer a few questions about your business, and we configure everything. No code, no integrations to manage.',
  },
  {
    q: 'What happens if I want to pause or cancel?',
    a: 'You\'re never locked in. You can pause your agents any time from the dashboard, and canceling is a single click. We don\'t hide cancellation behind support tickets.',
  },
];

// ── FAQ accordion item ──────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="font-semibold text-white group-hover:text-purple-300 transition-colors">
          {q}
        </span>
        <span
          className={`flex-shrink-0 text-purple-400 text-lg leading-none transition-transform duration-200 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (
        <p className="pb-5 text-gray-400 text-sm leading-relaxed pr-8">{a}</p>
      )}
    </div>
  );
}

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
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
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

      {/* ── Why We Built This (founder story — real, no placeholder reviews) ── */}
      <section className="py-24 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Built By Operators,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                For Operators
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Apex Agents wasn&apos;t dreamed up in a boardroom. It&apos;s the system we built to run growth for our own companies — productized.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 — Origin */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-purple-500/20 transition-all flex flex-col">
              <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-1">
                Born from our own grind. Apex Agents started as the internal engine running growth for our Indianapolis portfolio — scouting prospects, scoring them, and writing outreach while we slept. It worked, so we productized it.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="font-semibold text-sm">Apex Advantage Company</p>
                  <p className="text-gray-500 text-xs">Indianapolis, IN</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                  Founder-built
                </span>
              </div>
            </div>

            {/* Card 2 — Proof over promises */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-purple-500/20 transition-all flex flex-col">
              <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-1">
                Proof over promises. Every feature exists because we needed it: 9-signal lead scoring so no time is wasted on tire-kickers, outreach that doesn&apos;t read like a robot wrote it, and scheduling that never forgets to follow up.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="font-semibold text-sm">The Same Stack We Run</p>
                  <p className="text-gray-500 text-xs">Every single day</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                  9 lead signals
                </span>
              </div>
            </div>

            {/* Card 3 — Founding users */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-purple-500/20 transition-all flex flex-col">
              <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-1">
                Become a founding user. Apex Agents is in early access — founding users get direct access to the team, real input on the roadmap, and pricing locked in before public launch. Your wins become the case studies on this page.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="font-semibold text-sm">Early Access</p>
                  <p className="text-gray-500 text-xs">Limited founding cohort</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                  Locked-in pricing
                </span>
              </div>
            </div>

          </div>
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
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Built for Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Industry
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-16 max-w-2xl mx-auto">
            30+ local business niches supported out of the box — with industry-specific messaging, lead scoring, and outreach that sounds like it was written for your market.
          </p>
          <div className="space-y-10 text-left max-w-5xl mx-auto">
            {nicheCategories.map((cat) => (
              <div key={cat.label}>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4 text-center">
                  {cat.label}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {cat.niches.map((niche) => (
                    <Link
                      key={niche}
                      href="/signup"
                      className="px-5 py-2.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-200 text-sm font-medium hover:border-purple-400/50 hover:bg-purple-500/20 transition-colors"
                    >
                      {niche}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-sm mt-12">
            Don&apos;t see your niche? Apex Agents works for any local service business.
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Frequently Asked{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Questions
              </span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mt-4" />
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-6">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Preview ──────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-white/5 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Section heading */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Your Dashboard,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Always On
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Track every lead, every agent, every result — in real time.
            </p>
          </div>

          {/* Image + glow wrapper */}
          <div className="relative">
            {/* Purple glow blob behind image */}
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[300px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none"
              aria-hidden
            />
            {/* Dashboard screenshot */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-900/30">
              <img
                src="/dashboard-preview.svg"
                alt="Apex Agents dashboard — showing lead pipeline, active agents, and activity feed"
                className="w-full block"
                width={1200}
                height={700}
              />
            </div>
          </div>

          {/* CTA below image */}
          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-lg transition-all shadow-lg shadow-purple-900/50"
            >
              Start Free Trial →
            </Link>
          </div>
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
              <Link href="/pricing"
                className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 font-semibold text-lg transition-all">
                View Pricing &rarr;
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
