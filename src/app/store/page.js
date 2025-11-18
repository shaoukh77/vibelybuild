"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import BlissBackground from "@/components/BlissBackground";
import TimeAgo from "@/components/TimeAgo";
import { subscribeToPublicApps } from "@/lib/firestore";

export default function Store() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(24);
  const router = useRouter();

  // Subscribe to public apps (real-time)
  useEffect(() => {
    const unsubscribe = subscribeToPublicApps((publicApps) => {
      setApps(publicApps);
      setLoading(false);
    }, 100);

    return () => unsubscribe();
  }, []);

  const getDisplayName = (app) => {
    return app.ownerName || app.ownerId?.substring(0, 8) + "..." || "Anonymous";
  };

  const displayedApps = apps.slice(0, displayLimit);
  const hasMore = apps.length > displayLimit;

  return (
    <BlissBackground>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <TopNav />

        {/* Page Header */}
        <div className="mt-8 mb-8 text-center animate-fade-up">
          <h1 className="text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200">
            Vibe Store
          </h1>
          <p className="text-white/80 text-lg">Explore and launch AI-generated apps</p>
        </div>

        {loading ? (
          // Skeleton Loading
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-pulse"
              >
                <div className="w-full h-48 bg-white/20 rounded-2xl mb-4"></div>
                <div className="h-6 bg-white/20 rounded-lg mb-3 w-3/4"></div>
                <div className="h-4 bg-white/20 rounded-lg mb-2 w-full"></div>
                <div className="h-4 bg-white/20 rounded-lg mb-4 w-2/3"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                  <div className="h-3 bg-white/20 rounded w-24"></div>
                </div>
                <div className="h-10 bg-white/20 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : apps.length === 0 ? (
          // Empty State
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-16 text-center shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-fade-up">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-6xl">📦</span>
            </div>
            <p className="text-white text-2xl font-semibold mb-2">No apps published yet</p>
            <p className="text-white/60 text-lg">Be the first to build and publish an amazing app!</p>
          </div>
        ) : (
          <>
            {/* Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedApps.map((app, index) => (
                <div
                  key={app.id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/15 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer group animate-fade-up hover:scale-105 hover:glow-effect"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => router.push(`/store/${app.id}`)}
                >
                  {/* Cover Image */}
                  {app.coverUrl ? (
                    <div className="w-full h-48 rounded-2xl mb-4 overflow-hidden bg-black/20">
                      <img
                        src={app.coverUrl}
                        alt={app.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <div className="text-6xl opacity-60">🚀</div>
                    </div>
                  )}

                  {/* App Info */}
                  <h3 className="text-white text-xl font-bold mb-2 group-hover:text-purple-200 transition-colors line-clamp-1">
                    {app.title}
                  </h3>

                  {app.description && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {app.description}
                    </p>
                  )}

                  {/* Creator Info */}
                  <div className="flex items-center gap-3 mb-4 text-white/60 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-xs">
                      {getDisplayName(app)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-medium">{getDisplayName(app)}</span>
                      <TimeAgo timestamp={app.createdAt} className="text-xs" />
                    </div>
                  </div>

                  {/* View Button */}
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-full transition-all duration-300 group-hover:scale-105 shadow-lg shadow-purple-500/30 backdrop-blur-md border border-white/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:glow">
                    View App
                  </button>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-12 animate-fade-up">
                <button
                  onClick={() => setDisplayLimit(prev => prev + 24)}
                  className="px-8 py-4 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full text-white font-semibold hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                  Load More Apps
                </button>
              </div>
            )}

            {/* End Message */}
            {!hasMore && apps.length > 0 && (
              <div className="text-center mt-12">
                <div className="inline-block px-6 py-3 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]">
                  <p className="text-white/70 text-sm font-medium">You've seen all the apps!</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom Spacing */}
        <div className="h-16"></div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }

        .delay-2000 {
          animation-delay: 2000ms;
        }

        .hover\:glow-effect:hover {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.1);
        }

        .hover\:glow:hover {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </BlissBackground>
  );
}
