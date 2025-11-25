/**
 * Fake Stripe Checkout Page
 *
 * Simulates a Stripe checkout flow without real payment processing.
 * On success, sets user plan to "starter" in Firestore.
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function CheckoutContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/pricing');
    }
  }, [user, loading, router]);

  // Redirect if invalid plan
  useEffect(() => {
    if (plan !== 'starter') {
      router.push('/pricing');
    }
  }, [plan, router]);

  const handleFakeCheckout = async () => {
    if (!user) return;

    setProcessing(true);
    setError(null);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate random success/failure (95% success rate for demo)
      const isSuccess = Math.random() > 0.05;

      if (!isSuccess) {
        throw new Error('Payment declined. Please try again.');
      }

      // Update user plan in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        plan: 'starter',
        planActivatedAt: serverTimestamp(),
        stripeCustomerId: `fake_cus_${user.uid.slice(0, 10)}`,
        subscriptionStatus: 'active',
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSuccess(true);

      // Redirect to build page after 2 seconds
      setTimeout(() => {
        router.push('/build');
      }, 2000);

    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to process checkout');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-green-500/50 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to VibeBuild!</h1>
          <p className="text-white/70 mb-6">
            Your Starter plan is now active. You'll be redirected to the builder in a moment...
          </p>
          <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Checkout</h1>
            <p className="text-white/60 text-sm">Complete your subscription</p>
          </div>
        </div>

        {/* Plan Summary */}
        <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">Starter Plan</h3>
              <p className="text-white/60 text-sm">Billed monthly</p>
            </div>
            <div className="text-right">
              <div className="text-white/50 line-through text-sm">$10.00</div>
              <div className="text-2xl font-bold text-green-400">FREE</div>
            </div>
          </div>
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
            <p className="text-green-300 text-sm font-semibold">
              🎉 Pre-Beta Special: Free during Pre-Beta phase!
            </p>
          </div>
        </div>

        {/* Fake Payment Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">
              Card Information
            </label>
            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <div className="flex items-center gap-3 text-white/60">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-sm">•••• •••• •••• 4242</span>
              </div>
            </div>
            <p className="text-white/50 text-xs mt-2">
              Demo mode: No actual payment will be processed
            </p>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-semibold mb-2">
              Email
            </label>
            <div className="bg-white/5 border border-white/20 rounded-lg p-3">
              <p className="text-white/80">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleFakeCheckout}
            disabled={processing}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Complete Signup (Free)'
            )}
          </button>
          <button
            onClick={() => router.push('/pricing')}
            disabled={processing}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 flex items-center gap-2 text-white/50 text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>This is a demo checkout. No real payment is required or processed.</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
