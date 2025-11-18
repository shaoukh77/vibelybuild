"use client";

export default function MarketingCard({ icon, title, description }) {
  return (
    <div className="glass-card p-6 hover:scale-105 transition-transform">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <h3 className="text-white font-bold mb-2">{title || "Marketing Card"}</h3>
      <p className="text-white/60 text-sm">{description || "Marketing card placeholder"}</p>
    </div>
  );
}
