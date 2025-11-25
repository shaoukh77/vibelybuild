/**
 * Beta Badge Component
 *
 * Shows "PRE-BETA" badge in navbar and other locations
 */

'use client';

export function BetaBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/90 text-black text-xs font-bold rounded-full ${className}`}>
      <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>
      PRE-BETA
    </span>
  );
}
