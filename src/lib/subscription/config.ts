export type SubscriptionPlan = 'trial' | 'premium' | 'pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due';

export interface PlanLimits {
  agents: number;
  agiMessages: number;
  workflows: number;
  storage: number; // in bytes
  apiCalls: number;
  teamMembers: number;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  trial: {
    agents: 10,
    agiMessages: 100,
    workflows: 5,
    storage: 1 * 1024 * 1024 * 1024, // 1 GB
    apiCalls: 1000,
    teamMembers: 1,
  },
  premium: {
    agents: 50,
    agiMessages: 2000,
    workflows: 25,
    storage: 10 * 1024 * 1024 * 1024, // 10 GB
    apiCalls: 10000,
    teamMembers: 1,
  },
  pro: {
    agents: 999999, // Unlimited
    agiMessages: 10000,
    workflows: 999999, // Unlimited
    storage: 100 * 1024 * 1024 * 1024, // 100 GB
    apiCalls: 100000,
    teamMembers: 10,
  },
};

export const PLAN_PRICES = {
  premium: {
    monthly: 29,
    yearly: 290, // ~$24/month
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
  },
  pro: {
    monthly: 99,
    yearly: 990, // ~$82.50/month
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
  },
};

export const TRIAL_DURATION_DAYS = 3;

export const PLAN_FEATURES = {
  trial: [
    'Full access to all features',
    '10 agents',
    '100 AGI messages',
    '5 workflows',
    '1 GB storage',
    'Basic analytics',
    '3-day trial period',
  ],
  premium: [
    '50 agents',
    '2,000 AGI messages/month',
    '25 workflows',
    '10 GB storage',
    'Advanced analytics',
    'Priority support',
    'API access',
    'Email support',
  ],
  pro: [
    'Unlimited agents',
    '10,000 AGI messages/month',
    'Unlimited workflows',
    '100 GB storage',
    'Advanced analytics + exports',
    'Priority support',
    'API access',
    'Custom integrations',
    'Team collaboration (10 users)',
    'Dedicated account manager',
  ],
};

