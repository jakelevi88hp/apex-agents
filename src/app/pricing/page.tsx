'use client';
import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Check, Zap, Crown, Rocket, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getStorageItem } from '@/lib/utils/storage';
import SiteNav from '@/components/marketing/SiteNav';
import { PRICING_FAQS, SUPPORT_EMAIL } from '@/lib/marketing/pricing-faq';
import { PLAN_USAGE_LIMITS, AI_MESSAGE_RESET_NOTE } from '@/lib/subscription/plan-copy';

// Plan limit copy lives in src/lib/subscription/plan-copy.ts (shared with Settings, Docs and the welcome email).

function subscribeToStorage(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutError, setCheckoutError] = useState('');
  const { data: plans } = trpc.subscription.getPlans.useQuery();
  // Auth state is read the same way the tRPC client reads it: a JWT in
  // localStorage under "token". The server snapshot is "logged out" so the
  // prerendered HTML never shows "Current Plan" to visitors.
  const isLoggedIn = useSyncExternalStore(
    subscribeToStorage,
    () => Boolean(getStorageItem('token')),
    () => false,
  );
  // getCurrent is a protected procedure, so only ask for it when signed in.
  const { data: currentSub } = trpc.subscription.getCurrent.useQuery(undefined, {
    enabled: isLoggedIn,
  });

  const createCheckoutSession = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err) => {
      setCheckoutError(err.message || 'Failed to start checkout. Please try again.');
    },
  });

  const tiers = [
    {
      name: 'Free Trial',
      icon: Zap,
      price: 0,
      period: '3 days',
      description: 'Try Apex Agents free for 3 days',
      features: plans?.trial.features || [],
      cta: isLoggedIn ? 'Current Plan' : 'Start 3-Day Free Trial →',
      highlighted: false,
      plan: 'trial' as const,
    },
    {
      name: 'Premium',
      icon: Crown,
      price: billingPeriod === 'monthly' ? 29 : 24,
      period: billingPeriod === 'monthly' ? '/month' : '/month (billed yearly)',
      description: 'Perfect for individuals and small teams',
      features: plans?.premium.features || [],
      cta: 'Upgrade to Premium',
      highlighted: true,
      plan: 'premium' as const,
    },
    {
      name: 'Pro',
      icon: Rocket,
      price: billingPeriod === 'monthly' ? 99 : 82.5,
      period: billingPeriod === 'monthly' ? '/month' : '/month (billed yearly)',
      description: 'For power users and growing businesses',
      features: plans?.pro.features || [],
      cta: 'Upgrade to Pro',
      highlighted: false,
      plan: 'pro' as const,
    },
  ];

  const handleUpgrade = (plan: 'premium' | 'pro') => {
    setCheckoutError('');
    createCheckoutSession.mutate({ plan, billingPeriod });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />
      <main className="relative overflow-hidden pt-32 pb-24 px-4">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/3 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-300 mb-3">Start with a 3-day free trial. No credit card required. Upgrade anytime.</p>
          <p className="text-sm text-gray-400 mb-8">
            Questions before you start? Email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-purple-400 hover:text-purple-300 font-semibold">
              {SUPPORT_EMAIL}
            </a>
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Checkout error banner */}
        {checkoutError && (
          <div className="mb-8 max-w-2xl mx-auto bg-red-900/50 border border-red-500 rounded-lg px-4 py-3 text-red-300 text-sm text-center">
            {checkoutError}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isCurrentPlan = currentSub?.subscription?.plan === tier.plan;
            const isLoading = createCheckoutSession.isPending && tier.plan !== 'trial';

            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-purple-600 to-purple-800 shadow-2xl scale-105'
                    : 'bg-gray-800'
                } ${isCurrentPlan ? 'ring-4 ring-green-500' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      CURRENT
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <Icon className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-300 text-sm">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-white">${tier.price}</span>
                    <span className="text-gray-300 ml-2">{tier.period}</span>
                  </div>
                  {/* Logged-out visitors start on the free trial via /signup (no Stripe call, no card).
                      Logged-in users go straight to Stripe checkout, so the line is hidden for them. */}
                  {tier.plan === 'premium' && !isLoggedIn && (
                    <p className="mt-2 text-sm font-semibold text-white">3-day trial, no card needed</p>
                  )}
                </div>

                {!isLoggedIn ? (
                  // Logged-out visitors need an account before Stripe checkout
                  // (createCheckoutSession is a protected procedure), so every
                  // plan CTA sends them to signup instead of failing.
                  <Link
                    href="/signup"
                    className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 flex items-center justify-center gap-2 ${
                      tier.highlighted
                        ? 'bg-white text-purple-600 hover:bg-gray-100'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {tier.plan === 'trial' ? tier.cta : `Start Free, Then ${tier.name}`}
                  </Link>
                ) : (
                <button
                  onClick={() => tier.plan !== 'trial' && handleUpgrade(tier.plan)}
                  disabled={isCurrentPlan || tier.plan === 'trial' || createCheckoutSession.isPending}
                  className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 flex items-center justify-center gap-2 ${
                    isCurrentPlan || tier.plan === 'trial'
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : tier.highlighted
                      ? 'bg-white text-purple-600 hover:bg-gray-100 disabled:opacity-60'
                      : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60'
                  }`}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCurrentPlan ? 'Current Plan' : tier.cta}
                </button>
                )}

                {tier.plan === 'trial' && (
                  <p className="-mt-4 mb-6 text-center text-sm text-gray-400">No credit card required</p>
                )}

                <div className="mb-6 rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Usage limits</p>
                  <ul className="space-y-2">
                    {PLAN_USAGE_LIMITS[tier.plan].map((limit) => (
                      <li key={limit} className="text-sm text-white">
                        {limit}
                      </li>
                    ))}
                  </ul>
                </div>

                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-gray-400">
          {AI_MESSAGE_RESET_NOTE}
        </p>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            {PRICING_FAQS.map((faq) => (
              <div key={faq.question} className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-300">
                  {faq.answerParts.map((part, i) =>
                    part.type === 'email' ? (
                      <a
                        key={i}
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                    ) : (
                      <span key={i}>{part.value}</span>
                    )
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
