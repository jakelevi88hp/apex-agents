/**
 * Blog posts for the public marketing site.
 *
 * Content lives here as plain data (no MDX dependency) so the blog index,
 * post pages, sitemap, and JSON-LD all read from one source.
 *
 * Inline links inside paragraph and list text use markdown syntax:
 * [label](/path). Only internal paths and https URLs are rendered as links.
 *
 * Rules for posts (see marketing SEO notes): no invented customer results,
 * stats, testimonials, or ratings; no em-dashes; only link to routes that
 * exist on production.
 */

export type BlogBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'example'; label: string; lines: string[] };

export interface BlogPost {
  slug: string;
  /** <title> tag, absolute (keep under ~60 chars). */
  metaTitle: string;
  /** Visible H1. */
  title: string;
  /** Meta description (keep under ~155 chars). */
  description: string;
  /** Short summary for the blog index. */
  excerpt: string;
  /** ISO date (YYYY-MM-DD) the post was published. */
  datePublished: string;
  /** ISO date (YYYY-MM-DD) of the last meaningful content edit. Used for sitemap lastmod. */
  dateModified: string;
  /** Signup link with a ref tag so trial starts can be attributed to the post. */
  ctaHref: string;
  blocks: BlogBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-get-commercial-hvac-accounts-indianapolis',
    metaTitle: 'How to Get Commercial HVAC Accounts in Indianapolis | Apex',
    title: 'How to Get Commercial HVAC Accounts in Indianapolis',
    description:
      'A practical playbook for Indianapolis HVAC contractors: which commercial buyers to target, what paperwork they expect, and how to follow up.',
    excerpt:
      'Which commercial buyers to go after, what they expect before they hire you, and a simple outreach and follow-up routine you can run between service calls.',
    datePublished: '2026-10-24',
    dateModified: '2026-10-24',
    ctaHref: '/signup?ref=blog-commercial-hvac-indy',
    blocks: [
      {
        type: 'p',
        text: 'Residential HVAC work in Indianapolis follows the weather. The phone rings nonstop during the first heat wave and the first hard freeze, then goes quiet in the spring and fall. Commercial maintenance accounts are how many shops smooth that out: a property manager, restaurant group, or office building that pays for scheduled service and calls you first when something breaks.',
      },
      {
        type: 'p',
        text: 'There is no secret list of commercial accounts. Winning them comes down to picking the right buyers, being easy to approve as a vendor, and following up longer than your competitors do. This guide walks through each step in the order you would actually do it.',
      },
      { type: 'h2', text: '1. Decide which commercial accounts you actually want' },
      {
        type: 'p',
        text: '"Commercial" covers very different work. Before you reach out to anyone, match the buyer to what your crew can service well and respond to quickly.',
      },
      {
        type: 'ul',
        items: [
          'Property management companies running apartment communities or small office buildings. They often manage several properties, so one good relationship can turn into more buildings.',
          'Restaurants and bars. Kitchen heat makes cooling failures urgent, and owners care a lot about fast response. Some will also need refrigeration work, so be clear about whether you do it.',
          'Medical, dental, and veterinary offices, where patient comfort and air quality matter and the owner is usually on site.',
          'Churches, daycares, and private schools, which tend to have older equipment and limited facilities staff.',
          'Light industrial, warehouse, and flex space, especially along the major freight corridors around the city.',
          'Retail strip centers, where one landlord or manager may control the rooftop units for every tenant.',
        ],
      },
      {
        type: 'p',
        text: 'Pick one or two of these to start. Also set a realistic service radius. A shop based on the south side may answer a Greenwood restaurant in 30 minutes but struggle to promise the same to an office park in Carmel or Fishers at rush hour. Commercial buyers remember a missed response time much longer than they remember a good price.',
      },
      { type: 'h2', text: '2. Get your vendor paperwork ready before you pitch' },
      {
        type: 'p',
        text: 'The fastest way to lose a commercial lead is to get a "yes, send us your info" and then take two weeks to send it. Have a vendor packet ready to go:',
      },
      {
        type: 'ul',
        items: [
          'A current certificate of insurance (COI). Ask each prospect what general liability and workers comp limits they require and whether they need to be listed as additional insured.',
          'A signed W-9 and your contractor license details for the jurisdictions you work in.',
          'A one-page preventive maintenance (PM) agreement: visit frequency, what each visit includes (filters, belts, coils, refrigerant check, safety controls), and how emergency calls are priced.',
          'A response-time commitment you can actually keep, in writing.',
          'A sample service report with photos, so they can see what they would receive after each visit.',
          'Invoicing that works with their accounts payable process: PO numbers, not-to-exceed (NTE) amounts, and the property name or unit on every invoice.',
        ],
      },
      {
        type: 'p',
        text: 'Many property management companies also require vendors to register through a third-party compliance portal before they can be dispatched. Ask early which system they use and get registered. It is unglamorous work, and it is exactly where smaller competitors stall.',
      },
      { type: 'h2', text: '3. Build a short, qualified target list' },
      {
        type: 'p',
        text: 'You do not need thousands of names. A list of 50 to 100 well-chosen businesses in your radius is enough to keep you busy for months. Good places to build it:',
      },
      {
        type: 'ul',
        items: [
          'Google Maps searches by category and area, for example "property management" plus a neighborhood, suburb, or zip code you serve.',
          'Local property management and building owner associations. Many publish member directories or host events where facilities people show up.',
          'Commercial properties you already drive past on residential calls. Note the management company sign out front.',
          'Your existing residential customers who own or manage a business. They already trust you.',
        ],
      },
      {
        type: 'p',
        text: 'Then qualify each name using what is public. Read recent Google reviews for comments about the building being too hot, too cold, or the AC being out. Check whether the business responds to reviews at all, whether its listing is complete, and whether it has a working website with a real contact. None of this proves they need a new HVAC vendor. It tells you who might be open to a conversation and gives you something specific to say.',
      },
      { type: 'h2', text: '4. Reach out with something specific' },
      {
        type: 'p',
        text: 'Facilities managers and owners get plenty of "we are a full-service HVAC company" emails. What gets a reply is a short note that shows you looked at their situation and asks for something small. Here is a template you can adapt. It is an example only, not a message from a real campaign:',
      },
      {
        type: 'example',
        label: 'Example outreach (adapt before sending)',
        lines: [
          'Subject: Backup HVAC vendor for [property name]?',
          'Hi [first name], I run [your company], a licensed HVAC contractor based in [your area] of Indianapolis. I noticed a couple of recent reviews at [property name] mentioning units running warm, so I wanted to reach out before next cooling season.',
          'Some managers like to keep a second vendor on file for overflow and emergencies. If that is useful, I can send our COI and W-9 today, and I would be glad to do a no-obligation look at one rooftop unit so you can see our service report.',
          'Would a 10-minute call next week work?',
          '[Your name], [phone], [business address]. Reply "no thanks" and I will not follow up.',
        ],
      },
      {
        type: 'p',
        text: 'Timing matters. Spring and early fall are when many facilities people plan maintenance for the next season, so they are more likely to have time to talk. In the middle of a heat wave, lead with emergency capacity rather than a maintenance pitch.',
      },
      {
        type: 'p',
        text: 'If you send cold email to businesses, follow the CAN-SPAM Act basics: an honest subject line, your real business postal address, a clear way to opt out, and honoring opt-outs promptly. Phone calls and drop-ins with a printed one-pager still work well for owner-operated businesses like restaurants and dental offices.',
      },
      { type: 'h2', text: '5. Offer a low-risk first step' },
      {
        type: 'p',
        text: 'Asking a property manager to fire their current vendor is a big request. Asking to be the backup vendor is not. Good entry points include:',
      },
      {
        type: 'ul',
        items: [
          'Getting on the approved vendor list for overflow and after-hours calls.',
          'A paid inspection or tune-up on one building or one unit, with a photo report.',
          'A second opinion on a large replacement quote they already have.',
          'A PM agreement for a single property before you ask for the whole portfolio.',
        ],
      },
      {
        type: 'p',
        text: 'Each of these lets the buyer see how you show up, communicate, and invoice, which is what they are really evaluating.',
      },
      { type: 'h2', text: '6. Follow up on a schedule, not from memory' },
      {
        type: 'p',
        text: 'Commercial buying is slow. The manager who ignores your first email may be the one who calls in July when their current vendor cannot get there for three days. Many owners stop after one try because follow-ups live in their head instead of on a list.',
      },
      {
        type: 'p',
        text: 'Keep a simple tracker with the business, contact, last touch, and next step. A reasonable rhythm is a short follow-up a week after the first message, another a few weeks later with something useful (a seasonal maintenance checklist, for example), and then a check-in before each season change. Stop when someone asks you to.',
      },
      { type: 'h2', text: '7. Turn one building into several' },
      {
        type: 'p',
        text: 'Once you land a first account, the work that wins the second one is mostly operational:',
      },
      {
        type: 'ol',
        items: [
          'Arrive inside the response window you promised, every time.',
          'Send a service report with photos after every visit, even routine ones.',
          'Invoice correctly the first time, with the PO and property name on it.',
          'Flag aging equipment early so budget requests are not a surprise.',
          'After a few clean visits, ask whether the company manages other properties you could quote.',
        ],
      },
      { type: 'h2', text: 'Where Apex Agents fits' },
      {
        type: 'p',
        text: 'Steps 3, 4, and 6 are where most owners run out of time, because prospecting competes with billable calls. Apex Agents is built to run that loop for trade shops. Agents scout local businesses in the niche and city you choose, [score each prospect on nine public signals](/how-it-works) such as review recency, owner response rate, and listing completeness, and draft personalized outreach. You review, edit, or hold every draft before anything is sent, and follow-ups stay on a schedule.',
      },
      {
        type: 'p',
        text: 'You can try it with a 3-day free trial, no credit card required. After that, [plans start at $29/month](/pricing).',
      },
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

/** Most recent content change across all posts (for the /blog sitemap entry). */
export function latestPostDate(): string {
  return BLOG_POSTS.reduce((latest, p) => (p.dateModified > latest ? p.dateModified : latest), '1970-01-01');
}
