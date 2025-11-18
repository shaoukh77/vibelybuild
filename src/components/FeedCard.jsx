"use client";

export default function FeedCard({ title, description }) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-white font-bold mb-2">{title || "Feed Item"}</h3>
      <p className="text-white/60 text-sm">{description || "Feed card placeholder"}</p>
    </div>
  );
}
