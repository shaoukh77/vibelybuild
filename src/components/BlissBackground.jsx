/**
 * BlissBackground - Shared background wrapper for all pages
 * Provides consistent Bliss wallpaper + glass overlay
 */

export default function BlissBackground({ children, className = "" }) {
  return (
    <main className={`min-h-screen relative overflow-x-hidden ${className}`}>
      {/* Subtle Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-10"></div>
        <div className="bg-orb bg-orb-blue w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-10" style={{animationDelay: '7s'}}></div>
        <div className="bg-orb bg-orb-purple w-[400px] h-[400px] top-1/2 right-1/3 opacity-8" style={{animationDelay: '14s'}}></div>
      </div>

      {/* Page Content */}
      <div className="relative z-10">
        {children}
      </div>
    </main>
  );
}
