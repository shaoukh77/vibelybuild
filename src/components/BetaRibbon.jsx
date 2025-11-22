"use client";

export default function BetaRibbon() {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-purple-500 rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>

        {/* Badge */}
        <div className="relative px-4 py-1.5 bg-purple-600/90 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
          <span className="text-white font-bold text-xs tracking-wider">PRE-BETA ACCESS</span>
        </div>
      </div>
    </div>
  );
}
