/**
 * GlassWrapper - Reusable glass card component
 * Provides consistent glassmorphism styling across the app
 */

export default function GlassWrapper({ children, className = "", variant = "card" }) {
  const variants = {
    card: "bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.2)]",
    section: "bg-white/8 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.15)]",
    panel: "bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl shadow-inner",
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
