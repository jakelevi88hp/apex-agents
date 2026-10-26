/**
 * Copy for the commercial trade landing pages (/hvac, /auto).
 * Source: Marketing drafts apex-hvac-page-draft.md and apex-auto-page-draft.md
 * (Oct 2026), with long-tail keywords from apex-seo-fixes.md.
 * Rules: no own-shop origin claim, no customer names, no invented stats,
 * ratings, testimonials, or customer counts, no refund or guarantee language.
 * FAQ text feeds both the visible FAQ and the FAQPage JSON-LD so they cannot drift.
 */

export const TRADE_SUPPORT_EMAIL = 'apexagents@mail.grokbot.com';

export type TradeFaq = { question: string; answer: string };

export type TradePage = {
  slug: 'hvac' | 'auto';
  /** Absolute <title>. */
  metaTitle: string;
  description: string;
  /** Breadcrumb / JSON-LD name for this page. */
  breadcrumbName: string;
  eyebrow: string;
  h1: string;
  /** Paragraphs; may contain [label](/path) links. */
  intro: string[];
  ctaHref: string;
  problemHeading: string;
  problemLead: string;
  problem: string[];
  howHeading: string;
  scoutBody: string;
  scoreExample: string;
  outreachBody: string[];
  builtForHeading: string;
  builtForLead: string;
  builtFor: string[];
  builtForClose: string;
  featuresHeading: string;
  features: { title: string; body: string }[];
  example: { subject: string; body: string[] };
  faqs: TradeFaq[];
  closing: string;
  sibling: { href: string; label: string };
  /** Optional extra reading (e.g. a related blog post). */
  related?: { href: string; label: string };
};

/** The nine scoring inputs, worded as on /how-it-works and in the drafts. */
export const NINE_SIGNALS = [
  'Google rating versus what customers in that category usually expect',
  'Review volume',
  'Review recency (whether recent customers are still talking)',
  'Owner response rate on public reviews',
  'Listing completeness (hours, photos, categories, attributes)',
  'Website presence',
  'Local SEO gaps (name, address, and phone consistency, map-pack weaknesses)',
  'Niche fit for what you actually sell',
  'Opportunity window (how neglected the listing looks next to nearby peers)',
];

const sharedFaqs: TradeFaq[] = [
  {
    question: 'Do I approve messages before they send?',
    answer: 'Yes. You review, edit, or hold drafts from the dashboard. Nothing goes out without your approval.',
  },
  {
    question: 'Which cities does it cover?',
    answer:
      'You configure the niches and cities you serve. Apex is built for local service businesses, not national spray-and-pray lists.',
  },
  {
    question: 'Is cold email allowed?',
    answer:
      'You are responsible for how you use outreach. In the U.S., commercial email to business addresses generally requires an accurate subject line, a physical mailing address, and a working way to opt out (CAN-SPAM). Apex drafts messages; you decide what to send and stay compliant.',
  },
  {
    question: 'What happens after the 3-day trial?',
    answer: `You will be prompted to upgrade to a paid plan. Your data stays. You can upgrade anytime. For cancellations or billing questions, email ${TRADE_SUPPORT_EMAIL}.`,
  },
  {
    question: 'Can I cancel anytime?',
    answer: `Yes. For now, cancellations are handled by email at ${TRADE_SUPPORT_EMAIL}.`,
  },
];

const outreachLoop = (afterHours: string) => [
  'The builder drafts a tailored first message for each lead. It can reference what is actually on their listing: rating, review count, missing photos or hours, and obvious gaps. Not a mail-merge first name and a generic claim.',
  `You review, edit, or hold every draft from the dashboard. Approved outreach goes out on a schedule. Replies land where you already work. You step in when a prospect wants a conversation. Follow-ups are part of the same loop, so nothing relies on you remembering to nudge someone ${afterHours}.`,
];

export const HVAC_PAGE: TradePage = {
  slug: 'hvac',
  metaTitle: 'HVAC Lead Generation for Commercial Accounts | Apex Agents',
  description:
    'Find property managers, offices, and restaurants that need HVAC service. Score each lead on 9 signals and send outreach that sounds hand-written. 3-day free trial, no card.',
  breadcrumbName: 'HVAC Lead Generation',
  eyebrow: 'Commercial HVAC lead generation',
  h1: 'Win more commercial HVAC accounts without hiring a salesperson',
  intro: [
    'Residential calls keep the trucks busy in July and January. The revenue that pays the bills in the quiet months is commercial: property managers, offices, restaurants, apartments, churches, and schools that want a contractor on contract, not a one-time visit.',
    'Most HVAC owners know that. Almost none have time to find those accounts between emergency calls.',
    'Apex Agents is a commercial lead finder for HVAC contractors. It scouts commercial prospects in your market, scores each one on 9 public signals, and drafts outreach that mentions something real about them. You approve every message before it goes out. Apex Agents is built in Indianapolis by a local business owner, for HVAC owners who want more commercial accounts.',
  ],
  ctaHref: '/signup?ref=seo-hvac',
  problemHeading: 'The problem for HVAC shops',
  problemLead: 'Commercial maintenance agreements are the steady work. Finding them is not.',
  problem: [
    'After a full day on residential calls, nobody sits down to research property managers, check their Google listings, and write a first email. Spreadsheets go stale. Follow-ups get forgotten. The shops that already have commercial accounts win more of them, and everyone else stays stuck on seasonal residential.',
    'Buying more homeowner leads does not fix that. You need a short list of commercial prospects worth a conversation, and a way to reach them without hiring a salesperson.',
  ],
  howHeading: 'How Apex works for HVAC',
  scoutBody:
    'Point Apex at the niches you want: property management companies, apartment communities, restaurants, offices, churches, schools, and other local businesses that need heating and cooling on a schedule. Agents look for listings in your city and radius, enrich each one with public data, and keep the queue current as listings change.',
  scoreExample:
    'For an HVAC shop chasing commercial work, that means a property manager with a thin or quiet listing can be a different conversation than one that already looks polished. The score is a reason to prioritize, not a claim about how they run their buildings.',
  outreachBody: outreachLoop('at 9 p.m.'),
  builtForHeading: 'Built for commercial HVAC accounts',
  builtForLead:
    'Apex is not "more homeowner leads." It is a commercial HVAC prospecting tool for small contractors, aimed at the accounts that turn into maintenance agreements:',
  builtFor: [
    'Property managers who need a reliable HVAC vendor for multiple buildings',
    'Apartment and HOA communities',
    'Restaurants and commercial kitchens that need a maintenance contract',
    'Offices and medical suites',
    'Churches, schools, and other local institutions',
  ],
  builtForClose:
    'Configure the niches and cities you serve. The agents keep scouting. You spend time closing, not hunting.',
  featuresHeading: 'Features that matter on a service truck schedule',
  features: [
    { title: 'Scout while you work.', body: 'Agents run in the background so prospecting does not wait until the weekend.' },
    { title: '9-signal scoring.', body: 'See the highest-fit commercial prospects first.' },
    { title: 'Outreach that sounds hand-written.', body: 'Drafts reference real listing details. You approve before anything sends.' },
    { title: 'Follow-ups on a schedule.', body: 'The engine does not forget lukewarm leads after a full day in the field.' },
    { title: 'Live pipeline view.', body: 'Track leads, outreach, and replies in one dashboard.' },
  ],
  example: {
    subject: 'HVAC maintenance for [Property / Building name]',
    body: [
      'Hi [Name],',
      'I run an HVAC company that serves commercial and multi-family buildings in [City]. I noticed [one true thing from their listing: for example, a thin review history, missing hours, or no website].',
      'If you are looking for a contractor for seasonal maintenance or after-hours calls, I would like to introduce our team. Happy to send a short overview of how we work with property managers.',
      '[Your name]\n[Your company]\n[Phone]',
    ],
  },
  faqs: [
    {
      question: 'Does this work if I only do residential today?',
      answer:
        'Yes. The point of Apex for HVAC is to help you add commercial accounts (property managers, offices, restaurants, and similar), not to replace residential calls. If you only want more homeowner leads, this is not the right tool.',
    },
    ...sharedFaqs,
  ],
  closing:
    'If winning commercial HVAC work is on your list and prospecting never makes it onto the calendar, try Apex for 3 days. No credit card. Approve every message yourself.',
  sibling: { href: '/auto', label: 'Fleet accounts for auto repair shops' },
  related: {
    href: '/blog/how-to-get-commercial-hvac-accounts-indianapolis',
    label: 'How to get commercial HVAC accounts in Indianapolis',
  },
};

export const AUTO_PAGE: TradePage = {
  slug: 'auto',
  metaTitle: 'Auto Shop Fleet Lead Generation | Apex Agents',
  description:
    'Find local fleets, delivery companies, and property maintenance vehicles that need a repair shop. Score each lead on 9 signals and send outreach that sounds hand-written. 3-day free trial, no card.',
  breadcrumbName: 'Auto Shop Fleet Lead Generation',
  eyebrow: 'Fleet lead generation for auto shops',
  h1: 'Win more fleet accounts without hiring a salesperson',
  intro: [
    'Walk-in oil changes and one-off repairs keep the bays busy. The work that fills the schedule on slow Tuesdays is commercial: local fleets, delivery vans, property maintenance vehicles, and contractor trucks that need a shop they can call every month.',
    'Most independent shop owners know that. Almost none have time to find those accounts between diagnostics and comebacks.',
    'Apex Agents handles fleet account prospecting for auto repair shops. It scouts commercial prospects in your market, scores each one on 9 public signals, and drafts outreach that mentions something real about them. You approve every message before it goes out. Apex Agents is built in Indianapolis by a local business owner, for auto repair shops who want more commercial accounts.',
  ],
  ctaHref: '/signup?ref=seo-auto',
  problemHeading: 'The problem for auto repair shops',
  problemLead: 'Fleet accounts are the steady work. Finding them is not.',
  problem: [
    'After a full day turning wrenches, nobody sits down to research local delivery companies, check their Google listings, and write a first email. Spreadsheets go stale. Follow-ups get forgotten. Shops that already have fleet relationships keep them, and everyone else stays stuck competing on the next coupon oil change.',
    'Buying more consumer leads does not fix that. You need a short list of commercial prospects worth a conversation, and a way to reach them without hiring a salesperson.',
  ],
  howHeading: 'How to get fleet accounts with Apex',
  scoutBody:
    'Point Apex at the niches you want: delivery and courier companies, landscaping and property maintenance fleets, contractor and trades trucks, small trucking and freight yards, nonprofits with vehicle pools, and other local businesses that keep vehicles on the road. Agents look for listings in your city and radius, enrich each one with public data, and keep the queue current as listings change.',
  scoreExample:
    'For an auto shop chasing fleet work, that means a delivery company with a thin or quiet listing can be a different conversation than one that already looks polished. The score is a reason to prioritize, not a claim about how they run their vehicles.',
  outreachBody: outreachLoop('after closing time'),
  builtForHeading: 'Built for fleet and commercial auto accounts',
  builtForLead:
    'Apex is not "more homeowner oil-change calls." It finds work truck maintenance leads for independent repair shops, aimed at the accounts that turn into recurring fleet work:',
  builtFor: [
    'Local delivery and courier fleets',
    'Landscaping and property maintenance vehicles',
    'Contractor and trades trucks',
    'Small trucking and yard fleets',
    'Nonprofits, churches, and businesses with a vehicle pool',
  ],
  builtForClose:
    'Configure the niches and cities you serve. The agents keep scouting. You spend time booking bays, not hunting.',
  featuresHeading: 'Features that matter when every bay is full',
  features: [
    { title: 'Scout while you work.', body: 'Agents run in the background so prospecting does not wait until Saturday.' },
    { title: '9-signal scoring.', body: 'See the highest-fit commercial prospects first.' },
    { title: 'Outreach that sounds hand-written.', body: 'Drafts reference real listing details. You approve before anything sends.' },
    { title: 'Follow-ups on a schedule.', body: 'The engine does not forget lukewarm leads after a long day in the shop.' },
    { title: 'Live pipeline view.', body: 'Track leads, outreach, and replies in one dashboard.' },
  ],
  example: {
    subject: 'Fleet repair for [Company name] in [City]',
    body: [
      'Hi [Name],',
      'I run an auto repair shop that works with local fleets and work trucks in [City]. I noticed [one true thing from their listing: for example, a thin review history, missing hours, or no website].',
      'If you are looking for a shop for routine maintenance or unexpected repairs, I would like to introduce our team. Happy to send a short overview of how we handle fleet accounts.',
      '[Your name]\n[Your company]\n[Phone]',
    ],
  },
  faqs: [
    {
      question: 'Does this work if I mostly do retail customers today?',
      answer:
        'Yes. The point of Apex for auto shops is to help you add fleet and commercial accounts, not to replace walk-in work. If you only want more consumer oil-change leads, this is not the right tool.',
    },
    ...sharedFaqs,
  ],
  closing:
    'If winning fleet work is on your list and prospecting never makes it onto the calendar, try Apex for 3 days. No credit card. Approve every message yourself.',
  sibling: { href: '/hvac', label: 'Commercial accounts for HVAC contractors' },
};
