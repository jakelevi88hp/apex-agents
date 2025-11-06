'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { data: plans } = trpc.subscription.getPlans.useQuery();
  const { data: currentSub } = trpc.subscription.getCurrent.useQuery();

  const tiers = [
    {
      name: 'Free Trial',
      icon: Zap,
      price: 0,
      period: '3 days',
      description: 'Try all features free for 3 days',
      features: plans?.trial.features || [],
      cta: 'Current Plan',
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
      price: billingPeriod === 'monthly' ? 99 : 82.50,
      period: billingPeriod === 'monthly' ? '/month' : '/month (billed yearly)',
      description: 'For power users and growing businesses',
      features: plans?.pro.features || [],
      cta: 'Upgrade to Pro',
      highlighted: false,
      plan: 'pro' as const,
    },
  ];

  const handleUpgrade = (plan: 'premium' | 'pro') => {
    // Navigate to checkout (will be implemented in Phase 4)
    alert(`Upgrading to ${plan} - Stripe integration coming in Phase 4!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Start with a 3-day free trial. Upgrade anytime.
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

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isCurrentPlan = currentSub?.subscription?.plan === tier.plan;

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

                <button
                  onClick={() => tier.plan !== 'trial' && handleUpgrade(tier.plan)}
                  disabled={isCurrentPlan || tier.plan === 'trial'}
                  className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 ${
                    isCurrentPlan || tier.plan === 'trial'
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : tier.highlighted
                      ? 'bg-white text-purple-600 hover:bg-gray-100'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : tier.cta}
                </button>

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
          <h2 className="text-3xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-300">
                Yes! Cancel anytime from your account settings. No questions asked.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">
                What happens after my trial ends?
              </h3>
              <p className="text-gray-300">
                You'll be prompted to upgrade to a paid plan. Your data is safe and you can upgrade anytime.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">
                Can I upgrade or downgrade later?
              </h3>
              <p className="text-gray-300">
                Absolutely! Change your plan anytime from your account settings.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-300">
                Yes, we offer a 30-day money-back guarantee on all paid plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

