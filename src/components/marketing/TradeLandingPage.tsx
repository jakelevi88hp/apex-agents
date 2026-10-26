import Link from 'next/link';
import Script from 'next/script';
import SiteNav from '@/components/marketing/SiteNav';
import SiteFooter from '@/components/marketing/SiteFooter';
import BlogText from '@/components/marketing/BlogText';
import { NINE_SIGNALS, TRADE_SUPPORT_EMAIL, type TradePage } from '@/lib/marketing/trade-pages';

const SITE_URL = 'https://apex-ai-agent.com';

const PLANS = [
  { name: 'Free Trial', price: '$0 for 3 days', note: '100 AI messages. No credit card required.' },
  { name: 'Premium', price: '$29 / month', note: 'For individuals and small teams' },
  { name: 'Pro', price: '$99 / month', note: 'For power users and growing businesses' },
];

/** Server-rendered commercial trade landing page (/hvac, /auto). */
export default function TradeLandingPage({ page }: { page: TradePage }) {
  const url = `${SITE_URL}/${page.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: page.breadcrumbName, item: url },
        ],
      },
    ],
  };

  const primaryCta =
    'px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-lg transition-all shadow-lg shadow-purple-900/50';
  const secondaryCta =
    'px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 font-semibold text-lg transition-all';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Script
        id={`${page.slug}-json-ld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />

      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-300">{page.breadcrumbName}</span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-4">{page.eyebrow}</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8">{page.h1}</h1>
          <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
            {page.intro.map((p, i) => (
              <p key={i}><BlogText text={p} /></p>
            ))}
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href={page.ctaHref} className={primaryCta}>Start free for 3 days →</Link>
            <Link href="/how-it-works" className={secondaryCta}>See how it works</Link>
          </div>
          <p className="mt-5 text-sm text-gray-400">No credit card required.</p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">{page.problemHeading}</h2>
          <p className="text-xl text-gray-200 mb-4">{page.problemLead}</p>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            {page.problem.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-2">{page.howHeading}</h2>
          <p className="text-gray-400 mb-10">Three steps. You stay in control of what gets sent.</p>
          <div className="space-y-10">
            <div className="pl-6 border-l border-purple-500/30">
              <h3 className="text-2xl font-bold mb-3">1. Agents scout commercial prospects</h3>
              <p className="text-gray-300 leading-relaxed">{page.scoutBody}</p>
            </div>
            <div className="pl-6 border-l border-purple-500/30">
              <h3 className="text-2xl font-bold mb-3">2. Each lead is scored on 9 signals</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Leads land on a 0 to 200+ scale. The nine inputs are why the highest-value prospects rise
                and the rest stay out of your way:
              </p>
              <ol className="list-decimal pl-6 space-y-1 text-gray-300 mb-4">
                {NINE_SIGNALS.map((s) => <li key={s}>{s}</li>)}
              </ol>
              <p className="text-gray-300 leading-relaxed">{page.scoreExample}</p>
            </div>
            <div className="pl-6 border-l border-purple-500/30">
              <h3 className="text-2xl font-bold mb-3">3. Personalized outreach drafts. You approve. The publisher sends.</h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                {page.outreachBody.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </div>
          <p className="mt-8">
            <Link href="/how-it-works" className="text-purple-300 underline underline-offset-4 hover:text-white">
              See how it works
            </Link>
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">{page.builtForHeading}</h2>
          <p className="text-gray-300 leading-relaxed mb-4">{page.builtForLead}</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-300 mb-4">
            {page.builtFor.map((b) => <li key={b}>{b}</li>)}
          </ul>
          <p className="text-gray-300 leading-relaxed">{page.builtForClose}</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-6">{page.featuresHeading}</h2>
          <ul className="space-y-3 text-gray-300">
            {page.features.map((f) => (
              <li key={f.title}>
                <strong className="text-white">{f.title}</strong> {f.body}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Example outreach (labeled example, not a real send)</h2>
          <p className="text-gray-400 mb-6">
            Use this as a shape, not a script. Replace brackets with details from the prospect&apos;s public
            listing. Never invent facts.
          </p>
          <blockquote className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-300 space-y-3">
            <p className="font-semibold text-white">Subject: {page.example.subject}</p>
            {page.example.body.map((p, i) => (
              <p key={i} className="whitespace-pre-line">{p}</p>
            ))}
          </blockquote>
          <p className="mt-4 text-gray-400">
            Apex drafts messages in this spirit from the listing data. You edit them so they sound like you.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Built in Indianapolis</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Apex Agents is built in Indianapolis by a local business owner, for trade companies that want more
            commercial accounts. Founding users get the full scouting, scoring, and outreach loop from day one:
            not a demo that falls apart after signup.
          </p>
          <p className="text-gray-300 leading-relaxed">
            We are in early access. Founding users get direct access to the team and input on the roadmap.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Pricing</h2>
          <p className="text-gray-300 mb-6">
            Start with the Free Trial tier: 3 days, no credit card required.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {PLANS.map((plan) => (
              <div key={plan.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-bold text-white">{plan.name}</p>
                <p className="text-xl font-black text-purple-300 my-1">{plan.price}</p>
                <p className="text-sm text-gray-400">{plan.note}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-300 mb-2">
            Full plan details:{' '}
            <Link href="/pricing" className="text-purple-300 underline underline-offset-4 hover:text-white">Pricing</Link>
          </p>
          <p className="text-gray-400 text-sm">
            Questions about billing or cancellations:{' '}
            <a href={`mailto:${TRADE_SUPPORT_EMAIL}`} className="text-purple-300 hover:text-white">{TRADE_SUPPORT_EMAIL}</a>
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-8">FAQ</h2>
          <div className="space-y-6">
            {page.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />
          <div className="relative rounded-3xl border border-purple-500/20 bg-gray-900/80 p-10 text-center">
            <p className="text-lg text-gray-300 mb-8">{page.closing}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={page.ctaHref} className={primaryCta}>Start your free trial →</Link>
              <Link href="/pricing" className={secondaryCta}>View pricing</Link>
            </div>
            <p className="mt-8 text-sm text-gray-400">
              More detail:{' '}
              <Link href="/how-it-works" className="text-purple-300 hover:text-white">How it works</Link>
              {' · '}
              <Link href="/pricing" className="text-purple-300 hover:text-white">Pricing</Link>
              {' · '}
              <Link href={page.sibling.href} className="text-purple-300 hover:text-white">{page.sibling.label}</Link>
              {page.related && (
                <>
                  {' · '}
                  <Link href={page.related.href} className="text-purple-300 hover:text-white">{page.related.label}</Link>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
