"use client";

import { useState, useEffect } from "react";

export default function PreBetaNotice() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check localStorage for dismissed state
    const dismissed = localStorage.getItem("preBetaNoticeDismissed");
    if (dismissed === "true") {
      setVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("preBetaNoticeDismissed", "true");
  };

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 backdrop-blur-md border-b border-yellow-500/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-yellow-400 text-xl">⚠️</span>
          <p className="text-white/90 text-sm font-medium">
            <strong className="text-yellow-300">VibelyBuild.AI is in Pre-Beta.</strong>{" "}
            Features are still being added. Some modules may not work fully yet.
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
          aria-label="Dismiss notice"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
