/**
 * Early Access Waitlist Page
 *
 * Features:
 * - Email collection form
 * - Save to Firestore waitlist collection
 * - Confirmation message
 * - Benefits of joining early
 */

'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { BetaBadge } from '@/components/BetaBadge';

export default function EarlyAccessPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interestOptions = [
    { id: 'web', label: 'Web Apps' },
    { id: 'mobile', label: 'Mobile Apps' },
    { id: 'api', label: 'API Integration' },
    { id: 'ai', label: 'AI Features' },
    { id: 'teams', label: 'Team Collaboration' },
    { id: 'enterprise', label: 'Enterprise Features' }
  ];

  const toggleInterest = (id: string) => {
    setInterests(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Check if email already exists
      const waitlistRef = collection(db, 'waitlist');
      const q = query(waitlistRef, where('email', '==', email.toLowerCase()));
      const existingDocs = await getDocs(q);

      if (!existingDocs.empty) {
        throw new Error('This email is already on the waitlist!');
      }

      // Add to waitlist
      await addDoc(waitlistRef, {
        email: email.toLowerCase(),
        name: name.trim() || null,
        interests,
        source: 'early-access-page',
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      setSuccess(true);
      setEmail('');
      setName('');
      setInterests([]);

    } catch (err: any) {
      console.error('Error joining waitlist:', err);
      setError(err.message || 'Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-green-500/50 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-4">You're on the list!</h1>
          <p className="text-white/70 mb-6">
            Thanks for joining the VibeBuild early access waitlist. We'll send you an email when we're ready to onboard new users.
          </p>

          <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-300">
              💡 <strong>Early access members get:</strong>
            </p>
            <ul className="text-sm text-white/80 mt-2 space-y-1 text-left">
              <li>• Grandfathered pricing (current rates locked in)</li>
              <li>• Priority feature requests</li>
              <li>• Direct access to founders</li>
              <li>• Beta tester badge</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/pricing"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              View Pricing
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="text-2xl font-bold">
            VibeBuild
          </Link>
          <BetaBadge />
        </div>

        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/50 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-purple-300">LIMITED EARLY ACCESS</span>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Join the VibeBuild Waitlist
          </h1>
          <p className="text-xl text-white/70 mb-8">
            Be among the first to experience the future of AI-powered app development.
            Early access members get exclusive benefits and pricing.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Name (optional) */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                What are you interested in? (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleInterest(option.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      interests.includes(option.id)
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Joining...
                </span>
              ) : (
                'Join Waitlist'
              )}
            </button>

            <p className="text-xs text-white/50 text-center">
              By joining, you agree to receive updates about VibeBuild. Unsubscribe anytime.
            </p>
          </form>
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Early Access</h3>
            <p className="text-white/60 text-sm">
              Be the first to try new features and shape the future of VibeBuild with your feedback.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Special Pricing</h3>
            <p className="text-white/60 text-sm">
              Lock in grandfathered rates and save up to 40% compared to regular pricing.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Direct Support</h3>
            <p className="text-white/60 text-sm">
              Get priority support and direct access to our founders for any questions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-white/50 text-sm mb-4">
            Already have access?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
