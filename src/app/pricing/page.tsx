/**
 * Pricing Page - VibeBuild Pricing Plans
 *
 * Features:
 * - 3 pricing tiers (Starter FREE, Pro/Enterprise coming soon)
 * - Beta badge and messaging
 * - Fake Stripe checkout flow
 * - Plan comparison table
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import BetaRibbon from '@/components/BetaRibbon';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  interval: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  available: boolean;
  badge?: string;
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    originalPrice: 10,
    interval: 'month',
    description: 'Perfect for trying out VibeBuild during our Pre-Beta phase',
    features: [
      '5 app builds per month',
      'Web Apps only (Next.js)',
      'Live preview with hot-reload',
      'Code export & download',
      'Basic AI assistance',
      'Community support',
      'Beta features access',
      'No iOS/Android (coming soon)'
    ],
    cta: 'Start Building Free',
    highlighted: true,
    available: true,
    badge: 'FREE DURING PRE-BETA'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    description: 'For professional developers building production apps',
    features: [
      'Unlimited app builds',
      'iOS & Android apps',
      'Advanced AI models',
      'Priority preview servers',
      'API access',
      'Custom templates',
      'Priority support',
      'Team collaboration (3 users)'
    ],
    cta: 'Coming Soon',
    available: false,
    badge: 'COMING SOON'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 99,
    interval: 'month',
    description: 'For teams and organizations with custom needs',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom AI training',
      'Dedicated preview infrastructure',
      'SLA guarantees',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager'
    ],
    cta: 'Coming Soon',
    available: false,
    badge: 'COMING SOON'
  }
];

export default function PricingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    if (planId !== 'starter') {
      // Show coming soon modal for Pro/Elite plans
      setShowComingSoonModal(true);
      return;
    }

    setProcessingPlan(planId);

    // Simulate checkout flow (redirect to fake checkout)
    router.push(`/checkout?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Beta Ribbon */}
      <BetaRibbon />

      {/* Beta Banner */}
      <div className="bg-yellow-500/90 text-black py-3 px-4 text-center font-semibold text-sm">
        ⚠️ This is Pre-Beta — Official Beta coming soon. Builders are limited during this phase.
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/50 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-purple-300">PRE-BETA PRICING</span>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Start building for free during our Pre-Beta phase. No credit card required.
          </p>
        </div>

        {/* Beta Development Notice */}
        <div className="max-w-3xl mx-auto mb-12 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-orange-400 text-sm">⚠️</span>
            </div>
            <div className="text-left flex-1">
              <h3 className="text-orange-200 font-bold text-sm mb-1.5">Pre-Beta Phase</h3>
              <p className="text-orange-100/80 text-xs leading-relaxed">
                Currently supporting <strong>Web Apps only</strong>. Features may be unstable. iOS and Android support launching with full Beta. Early users get grandfathered pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 backdrop-blur-lg border-2 transition-all ${
                plan.highlighted
                  ? 'border-purple-500 bg-purple-500/10 scale-105 shadow-2xl shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              } ${!plan.available ? 'opacity-60' : ''}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                  plan.available
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-white/60 text-sm mb-4">{plan.description}</p>

                <div className="mb-4">
                  {plan.originalPrice && plan.price === 0 && (
                    <div className="text-white/50 line-through text-lg mb-1">
                      ${plan.originalPrice}/{plan.interval}
                    </div>
                  )}
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold">
                      ${plan.price}
                    </span>
                    <span className="text-white/60">/{plan.interval}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={!plan.available || processingPlan === plan.id}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  plan.available
                    ? plan.highlighted
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:scale-105 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/5 text-white/40 cursor-not-allowed'
                }`}
              >
                {processingPlan === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <details className="bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10">
              <summary className="font-semibold cursor-pointer">
                What happens after the Pre-Beta phase?
              </summary>
              <p className="mt-3 text-white/70 text-sm">
                When we launch our official Beta, the Starter plan will be $10/month. All Pre-Beta users will be grandfathered in with special pricing and benefits.
              </p>
            </details>

            <details className="bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10">
              <summary className="font-semibold cursor-pointer">
                Are there any limitations during Pre-Beta?
              </summary>
              <p className="mt-3 text-white/70 text-sm">
                Yes, during Pre-Beta, Starter users are limited to 5 app builds per month. We're also limiting the total number of users to ensure quality. Apply for early access to secure your spot.
              </p>
            </details>

            <details className="bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10">
              <summary className="font-semibold cursor-pointer">
                Can I upgrade or downgrade my plan?
              </summary>
              <p className="mt-3 text-white/70 text-sm">
                Once Pro and Enterprise plans are available, you'll be able to upgrade at any time. Downgrades will take effect at the end of your billing cycle.
              </p>
            </details>

            <details className="bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10">
              <summary className="font-semibold cursor-pointer">
                What payment methods do you accept?
              </summary>
              <p className="mt-3 text-white/70 text-sm">
                When billing launches, we'll accept all major credit cards, debit cards, and ACH transfers via Stripe. Currently, no payment is required during Pre-Beta.
              </p>
            </details>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-12 border border-purple-500/30 backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-4">Not Sure Yet?</h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Join our waitlist to stay updated on new features, beta launch dates, and exclusive early access opportunities.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/early-access"
              className="px-8 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Join Waitlist
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowComingSoonModal(false)}>
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border-2 border-purple-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Pro Features Coming Soon!</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Pro and Elite plans will unlock during our official Beta launch. These features include iOS/Android support, unlimited builds, advanced AI models, and team collaboration.
              </p>
              <p className="text-purple-300 text-sm mb-6 font-semibold">
                Join the waitlist to get notified when Beta launches!
              </p>
              <div className="flex gap-3">
                <Link
                  href="/early-access"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:scale-105 rounded-lg font-semibold transition-all"
                >
                  Join Waitlist
                </Link>
                <button
                  onClick={() => setShowComingSoonModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
