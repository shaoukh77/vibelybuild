/**
 * Beta Banner Component
 *
 * Yellow banner showing Pre-Beta status and limitations
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

export function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-yellow-500/95 text-black border-b border-yellow-600">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="hidden sm:flex items-center justify-center w-8 h-8 bg-black/10 rounded-full">
              <span className="text-lg">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                <span className="sm:hidden">⚠️ </span>
                This is Pre-Beta — Official Beta coming soon. Builders are limited during this phase.
              </p>
              <p className="text-xs text-black/70 mt-0.5 hidden sm:block">
                Early access users get special pricing and benefits when we launch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/early-access"
              className="hidden sm:inline-block px-4 py-1.5 bg-black text-yellow-400 rounded-lg text-xs font-semibold hover:bg-black/90 transition-all"
            >
              Join Waitlist
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-black/10 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
