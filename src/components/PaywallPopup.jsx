/**
 * Paywall Popup Component
 *
 * Shows when trial users try to access premium features
 */

'use client';

import { useRouter } from 'next/navigation';

export default function PaywallPopup({ open, onClose, feature = 'this feature' }) {
  const router = useRouter();

  if (!open) return null;

  const handleUpgrade = () => {
    router.push('/pricing');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/50 rounded-2xl max-w-md w-full p-8 shadow-2xl shadow-purple-500/20 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Upgrade to Unlock
          </h2>
          <p className="text-white/60 text-sm">
            {feature} is available on paid plans
          </p>
        </div>

        {/* Features */}
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-white/80 text-sm mb-3 font-semibold">Upgrade to get:</p>
          <ul className="space-y-2">
            {[
              'Publish apps to Vibe Store',
              '5 builds per month',
              'Priority support',
              'Early access to new features'
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-white/70">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
          >
            Not Now
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            View Plans →
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
        >
          ✕
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
