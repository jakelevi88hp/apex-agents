'use client';
import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Check, Zap, Crown, Rocket, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { getStorageItem } from '@/lib/utils/storage';
import SiteNav from '@/components/marketing/SiteNav';

// MUST FILL BEFORE SHIP: replace with the real support address.
const SUPPORT_EMAIL = '{{SUPPORT_EMAIL}}';

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
      description: 'Try all features free for 3 days',
      features: plans?.trial.features || [],
      cta: isLoggedIn ? 'Current Plan' : 'Start Free Trial →',
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
          <p className="text-xl text-gray-300 mb-8">Start with a 3-day free trial. Upgrade anytime.</p>

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
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

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
                    {tier.cta}
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

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-300">
                Yes. For now, cancellations are handled by email. Write to us at{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-purple-400 hover:text-purple-300 font-semibold">{SUPPORT_EMAIL}</a> and we&apos;ll cancel your plan.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">
                What happens after my trial ends?
              </h3>
              <p className="text-gray-300">
                You&apos;ll be prompted to upgrade to a paid plan. Your data is safe and you can upgrade
                anytime.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">
                Can I upgrade or downgrade later?
              </h3>
              <p className="text-gray-300">
                Yes. You can upgrade anytime from this page. To downgrade, email us at{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-purple-400 hover:text-purple-300 font-semibold">{SUPPORT_EMAIL}</a>.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">Questions about billing?</h3>
              <p className="text-gray-300">
                Contact us at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-purple-400 hover:text-purple-300 font-semibold">{SUPPORT_EMAIL}</a> and we&apos;ll help.
              </p>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
