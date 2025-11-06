'use client';

import { AlertCircle, Crown, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SubscriptionBanner() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const { data: subscription } = trpc.subscription.getCurrent.useQuery();

  if (!subscription || dismissed) {
    return null;
  }

  const { subscription: sub, isExpired, daysRemaining } = subscription;

  // Don't show banner for active paid plans
  if (sub?.plan !== 'trial' && sub?.status === 'active') {
    return null;
  }

  // Trial expired
  if (isExpired) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">
              Your trial has expired. Upgrade now to continue using Apex Agents.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/pricing')}
              className="bg-white text-red-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Upgrade Now
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trial active - show countdown
  if (sub?.plan === 'trial' && daysRemaining > 0) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-3 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5" />
            <p className="font-medium">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left in your free trial.
              Upgrade to keep all your data and continue building!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/pricing')}
              className="bg-white text-purple-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View Plans
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Subscription canceled
  if (sub?.cancelAtPeriodEnd) {
    const endDate = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'soon';
    return (
      <div className="bg-yellow-600 text-white px-4 py-3 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">
              Your subscription will end on {endDate}. Reactivate to keep your access.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="bg-white text-yellow-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Reactivate
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

