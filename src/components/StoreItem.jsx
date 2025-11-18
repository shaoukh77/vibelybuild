"use client";

export default function StoreItem({ title, description, price }) {
  return (
    <div className="glass-card p-4 hover:bg-white/10 transition-all cursor-pointer">
      <h3 className="text-white font-bold mb-2">{title || "Store Item"}</h3>
      <p className="text-white/60 text-sm mb-3">{description || "Store item placeholder"}</p>
      {price && <p className="text-purple-400 font-bold">{price}</p>}
    </div>
  );
}
