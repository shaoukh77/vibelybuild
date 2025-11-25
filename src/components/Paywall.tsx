/**
 * Paywall Component
 *
 * Checks user's subscription plan and blocks access if needed.
 * Shows upgrade prompt with link to pricing page.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserPlan } from '@/lib/user/userPlan';
import Link from 'next/link';

interface PaywallProps {
  children: React.ReactNode;
  requiredFeature: 'build' | 'ads' | 'api' | 'teams';
  fallback?: React.ReactNode;
}

export function Paywall({ children, requiredFeature, fallback }: PaywallProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (authLoading) return;

      if (!user) {
        router.push('/login?redirect=' + window.location.pathname);
        return;
      }

      try {
        const data = await getUserPlan(user.uid);
        setPlanData(data);

        if (!data) {
          setHasAccess(false);
          return;
        }

        // Check access based on feature
        let access = false;
        switch (requiredFeature) {
          case 'build':
          case 'ads':
            access = data.plan !== 'free';
            break;
          case 'api':
          case 'teams':
            access = data.plan === 'pro' || data.plan === 'enterprise';
            break;
        }

        setHasAccess(access);
      } catch (error) {
        console.error('Error checking plan access:', error);
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    }

    checkAccess();
  }, [user, authLoading, requiredFeature, router]);

  // Loading state
  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Checking access...</p>
        </div>
      </div>
    );
  }

  // No access - show paywall
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 text-center">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Subscription Required
          </h1>
          <p className="text-white/70 mb-2">
            {getFeatureMessage(requiredFeature)}
          </p>
          <p className="text-white/60 text-sm mb-8">
            Your current plan: <span className="font-semibold text-purple-400">{planData?.plan || 'free'}</span>
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              View Pricing
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-8 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <p className="text-yellow-300 text-sm">
              💡 <strong>Pre-Beta Special:</strong> The Starter plan is currently FREE!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Has access - render children
  return <>{children}</>;
}

function getFeatureMessage(feature: string): string {
  switch (feature) {
    case 'build':
      return 'You need an active subscription to access the app builder.';
    case 'ads':
      return 'You need an active subscription to access the ads builder.';
    case 'api':
      return 'API access is only available on Pro and Enterprise plans.';
    case 'teams':
      return 'Team collaboration is only available on Pro and Enterprise plans.';
    default:
      return 'You need an active subscription to access this feature.';
  }
}
