'use client';

import { Lock, Crown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  feature: string;
  requiredPlan: 'premium' | 'pro';
  currentUsage?: number;
  limit?: number;
}

export function UpgradePrompt({ feature, requiredPlan, currentUsage, limit }: UpgradePromptProps) {
  const router = useRouter();

  const planNames = {
    premium: 'Premium',
    pro: 'Pro',
  };

  const planPrices = {
    premium: '$29/month',
    pro: '$99/month',
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
        <Lock className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Unlock {feature}
      </h3>

      {currentUsage !== undefined && limit !== undefined && (
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You've reached your limit ({currentUsage}/{limit})
        </p>
      )}

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Upgrade to <span className="font-semibold text-purple-600 dark:text-purple-400">{planNames[requiredPlan]}</span> to access this feature and unlock your full potential.
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Crown className="w-6 h-6 text-purple-600" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {planPrices[requiredPlan]}
          </span>
        </div>
        <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-300">
          {requiredPlan === 'premium' ? (
            <>
              <li>✓ 50 agents</li>
              <li>✓ 2,000 AGI messages/month</li>
              <li>✓ 25 workflows</li>
              <li>✓ 10 GB storage</li>
              <li>✓ Priority support</li>
            </>
          ) : (
            <>
              <li>✓ Unlimited agents</li>
              <li>✓ 10,000 AGI messages/month</li>
              <li>✓ Unlimited workflows</li>
              <li>✓ 100 GB storage</li>
              <li>✓ Team collaboration (10 users)</li>
              <li>✓ Custom integrations</li>
            </>
          )}
        </ul>
      </div>

      <button
        onClick={() => router.push('/pricing')}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        Upgrade to {planNames[requiredPlan]}
        <ArrowRight className="w-5 h-5" />
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        30-day money-back guarantee • Cancel anytime
      </p>
    </div>
  );
}

