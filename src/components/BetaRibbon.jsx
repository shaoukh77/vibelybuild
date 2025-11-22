"use client";

export default function BetaRibbon() {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>

        {/* Badge */}
        <div className="relative px-4 py-1.5 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
          <span className="text-white font-bold text-xs tracking-wider">BETA</span>
        </div>
      </div>
    </div>
  );
}
