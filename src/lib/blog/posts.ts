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
    dateModified: '2026-10-27',
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
        text: 'Steps 3, 4, and 6 are where most owners run out of time, because prospecting competes with billable calls. Apex Agents is built to run that loop for trade shops, including [HVAC contractors chasing commercial accounts](/hvac). Agents scout local businesses in the niche and city you choose, [score each prospect on nine public signals](/how-it-works) such as review recency, owner response rate, and listing completeness, and draft personalized outreach. You review, edit, or hold every draft before anything is sent, and follow-ups stay on a schedule.',
      },
      {
        type: 'p',
        text: 'You can try it with a 3-day free trial, no credit card required. After that, [plans start at $29/month](/pricing).',
      },
    ],
  },
  {
    slug: 'how-to-get-fleet-customers-auto-repair-shop-indianapolis',
    metaTitle: 'Fleet Customers for Auto Repair Shops in Indianapolis | Apex',
    title: 'How to Get Fleet Customers for Your Auto Repair Shop in Indianapolis',
    description:
      'A practical guide for Indianapolis auto repair shops: which local fleets to target, what fleet buyers expect, and how to follow up until they call.',
    excerpt:
      'Which local fleets fit an independent shop, what fleet managers check before they send you a vehicle, and an outreach and follow-up routine you can run after closing.',
    datePublished: '2026-10-27',
    dateModified: '2026-10-27',
    ctaHref: '/signup?ref=blog-fleet-auto-indy',
    blocks: [
      {
        type: 'p',
        text: 'Retail repair work is unpredictable. One week every bay is full with brakes and check engine lights, and the next week you are waiting on the phone. Fleet customers are how many independent shops even that out: a local business that keeps vans, pickups, or box trucks on the road and needs a shop it can send them to every month.',
      },
      {
        type: 'p',
        text: 'Indianapolis has plenty of these businesses. Delivery and courier companies, landscapers, plumbers, electricians, property maintenance crews, and small freight outfits all run vehicles that need oil changes, tires, brakes, and fast repairs. Most of them do not have a contract with a big dealer. They have whoever answered the phone last time. This guide walks through how to become the shop they call first.',
      },
      { type: 'h2', text: '1. Pick the fleets that fit your shop' },
      {
        type: 'p',
        text: '"Fleet" can mean two vans or two hundred tractors. Start with the accounts your bays, lifts, and techs can actually handle well, and that are close enough to drop off a vehicle without losing half a day.',
      },
      {
        type: 'ul',
        items: [
          'Local delivery and courier companies running cargo vans and small box trucks. Vehicle downtime costs them routes, so fast turnaround matters more than the lowest price.',
          'Trades and contractor companies: HVAC, plumbing, electrical, roofing, and general contractors with pickups and service vans. You may already be fixing the owner\'s personal vehicle.',
          'Landscaping, snow removal, and property maintenance crews, whose trucks work hard in season and need to be ready before it starts.',
          'Small trucking and freight yards, if you have the equipment and qualified techs for heavier vehicles.',
          'Churches, nonprofits, daycares, and senior services that run a few passenger vans and have nobody on staff who handles maintenance.',
        ],
      },
      {
        type: 'p',
        text: 'Choose one or two of these to focus on. Then set a realistic radius. A shop on the west side near the airport may be an easy drop-off for warehouses and courier companies along the I-70 corridor, but a harder sell to a landscaper based in Noblesville. Fleet managers care about how far the vehicle travels and how long it sits.',
      },
      { type: 'h2', text: '2. Know what fleet buyers check before they send you a vehicle' },
      {
        type: 'p',
        text: 'A fleet manager or owner is trusting you with a vehicle that earns money every day it runs. Before you pitch, have answers ready for the questions they will ask:',
      },
      {
        type: 'ul',
        items: [
          'Turnaround: how fast you can get a vehicle in, diagnosed, and back on the road, and whether you will call before doing work above an agreed amount.',
          'Approval limits: many fleets set a not-to-exceed (NTE) amount per visit. Anything above it needs a phone or text approval first. Ask what their limit is and how they want to be contacted.',
          'Invoicing: PO numbers, unit or VIN on every invoice, and net terms. Ask whether they want a monthly statement instead of a card on file.',
          'Records: a clear service history per vehicle, with mileage, so they can see what was done and when the next service is due.',
          'Insurance and paperwork: a certificate of insurance, a W-9, and any garage liability or garagekeepers coverage they ask about.',
          'Technician credentials: ASE certifications are widely recognized and worth listing if your techs have them.',
          'Convenience: early drop-off, an after-hours key drop, or pickup and delivery for nearby accounts.',
        ],
      },
      {
        type: 'p',
        text: 'If you plan to work on heavier commercial vehicles, know the federal rules. Under FMCSA regulations, commercial motor vehicles used in interstate commerce must pass a periodic inspection at least once every 12 months ([49 CFR 396.17](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/section-396.17)). A carrier can have a commercial garage perform that inspection, as long as the garage has appropriate facilities and uses inspectors who meet the qualification rules in 49 CFR 396.19. If your shop can do this properly, it is a concrete reason for a small carrier to talk to you.',
      },
      { type: 'h2', text: '3. Build a short, qualified list of local fleets' },
      {
        type: 'p',
        text: 'You do not need a huge database. A list of 50 to 100 businesses within your radius is plenty to work through. Good places to find them:',
      },
      {
        type: 'ul',
        items: [
          'Google Maps searches by category and area, for example "courier service", "landscaping", or "plumber" plus a suburb, neighborhood, or zip code you serve.',
          'Lettered trucks and vans you see on the road, in your parking lot, or parked overnight near industrial parks. Write down the company name.',
          'Your current retail customers who own a business. Ask what they drive for work and who services it now.',
          'Local business groups and chambers of commerce, where trades and service owners show up in person.',
          'Parts reps and suppliers, who often know which local companies run work vehicles.',
        ],
      },
      {
        type: 'p',
        text: 'Then qualify each name with what is public. Does the business have a complete Google listing, a working website, and recent reviews? Are they hiring drivers or technicians, which can mean they are growing? Do their photos show a handful of vehicles or a whole lot? None of this tells you they need a new shop. It tells you who is worth a call and gives you something specific to mention.',
      },
      { type: 'h2', text: '4. Reach out with something specific' },
      {
        type: 'p',
        text: 'Business owners ignore generic "we do fleet service" messages. What gets a reply is short, local, and asks for something small. Here is a template you can adapt. It is an example only, not a message from a real campaign:',
      },
      {
        type: 'example',
        label: 'Example outreach (adapt before sending)',
        lines: [
          'Subject: Shop for [Company name]\'s vans on the [side of town]?',
          'Hi [first name], I run [your shop], an independent repair shop on [street or area] in Indianapolis. I have seen your vans around [area] and wanted to introduce us.',
          'A lot of small fleets like having one shop that knows their vehicles, calls before going over an agreed amount, and puts the unit number on every invoice. If that would help, I can send our COI and W-9 today, and we would be glad to do an inspection on one vehicle so you can see how we report.',
          'Would a quick call this week work?',
          '[Your name], [phone], [business address]. Reply "no thanks" and I will not follow up.',
        ],
      },
      {
        type: 'p',
        text: 'Phone calls and in-person drop-ins with a printed one-pager work well, especially with owner-operated trades businesses. If you send cold email, follow the CAN-SPAM Act basics: an honest subject line, your real business postal address, a clear way to opt out, and honoring opt-outs promptly.',
      },
      { type: 'h2', text: '5. Offer an easy first job' },
      {
        type: 'p',
        text: 'Asking a business to move its whole fleet to you on day one is a big ask. A small first job lets them test you without risk:',
      },
      {
        type: 'ul',
        items: [
          'Service one vehicle, such as an oil change and multi-point inspection with a written report.',
          'Be the backup shop for overflow and breakdowns when their current shop is booked.',
          'Offer a second opinion on a large repair estimate they already have.',
          'Set up a simple preventive maintenance schedule for two or three vehicles before asking for the rest.',
        ],
      },
      {
        type: 'p',
        text: 'They are really evaluating how you communicate, how fast the vehicle comes back, and whether the invoice matches what you said.',
      },
      { type: 'h2', text: '6. Follow up on a schedule, not from memory' },
      {
        type: 'p',
        text: 'Fleet decisions are rarely urgent until a van breaks down on a route. The owner who ignores your first message may call the week their current shop cannot fit them in. Most shops never get that call because they stopped after one try.',
      },
      {
        type: 'p',
        text: 'Keep a simple tracker with the business, contact, last touch, and next step. A reasonable rhythm is a short follow-up a week after the first message, another a few weeks later with something useful (a pre-winter checklist for work trucks, for example), and a check-in before each busy season. Stop when someone asks you to.',
      },
      { type: 'h2', text: '7. Keep the account and grow it' },
      {
        type: 'p',
        text: 'Once you land a fleet, the work that keeps it is mostly operational:',
      },
      {
        type: 'ol',
        items: [
          'Hit the turnaround time you promised, and call early if a part delays the job.',
          'Never go over the approval limit without asking first.',
          'Put the unit number, VIN or plate, mileage, and PO on every invoice.',
          'Send a reminder when each vehicle is due for service, so they do not have to track it.',
          'After a few clean visits, ask whether there are other vehicles, locations, or partner businesses you could service.',
        ],
      },
      { type: 'h2', text: 'Where Apex Agents fits' },
      {
        type: 'p',
        text: 'Steps 3, 4, and 6 are where most shop owners run out of time, because prospecting competes with the cars already in the bays. Apex Agents is built to run that loop for [auto repair shops chasing fleet accounts](/auto). Agents scout local businesses in the niches and cities you choose, such as courier companies, contractors, and property maintenance crews, [score each prospect on nine public signals](/how-it-works) like review recency, owner response rate, and listing completeness, and draft personalized outreach. You review, edit, or hold every draft before anything is sent, and follow-ups stay on a schedule.',
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
