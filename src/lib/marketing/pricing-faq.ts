export const SUPPORT_EMAIL = 'apexagents@mail.grokbot.com';

export type PricingFaqPart =
  | { type: 'text'; value: string }
  | { type: 'email' };

export type PricingFaq = {
  question: string;
  /** Parts rendered on the page; join text + email for schema. */
  answerParts: PricingFaqPart[];
};

export const PRICING_FAQS: PricingFaq[] = [
  {
    question: 'Can I cancel anytime?',
    answerParts: [
      { type: 'text', value: 'Yes. For now, cancellations are handled by email. Write to us at ' },
      { type: 'email' },
      { type: 'text', value: " and we'll cancel your plan." },
    ],
  },
  {
    question: 'What happens after my trial ends?',
    answerParts: [
      {
        type: 'text',
        value:
          "You'll be prompted to upgrade to a paid plan. Your data is safe and you can upgrade anytime.",
      },
    ],
  },
  {
    question: 'Can I upgrade or downgrade later?',
    answerParts: [
      { type: 'text', value: 'Yes. You can upgrade anytime from this page. To downgrade, email us at ' },
      { type: 'email' },
      { type: 'text', value: '.' },
    ],
  },
  {
    question: 'Questions about billing?',
    answerParts: [
      { type: 'text', value: 'Contact us at ' },
      { type: 'email' },
      { type: 'text', value: " and we'll help." },
    ],
  },
];

export function pricingFaqAnswerText(faq: PricingFaq): string {
  return faq.answerParts
    .map((part) => (part.type === 'email' ? SUPPORT_EMAIL : part.value))
    .join('');
}
