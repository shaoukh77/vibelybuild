"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import TimeAgo from "@/components/TimeAgo";
import { getPublicApp, getBuild } from "@/lib/firestore";

export default function AppDetail() {
  const params = useParams();
  const router = useRouter();
  const appId = params.appId;

  const [app, setApp] = useState(null);
  const [build, setBuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    async function loadApp() {
      try {
        setLoading(true);
        setError(null);

        // Load public app
        const appData = await getPublicApp(appId);
        if (!appData) {
          setError("App not found");
          return;
        }
        setApp(appData);

        // Load associated build
        if (appData.buildId) {
          const buildData = await getBuild(appData.buildId);
          setBuild(buildData);
        }
      } catch (err) {
        console.error("Error loading app:", err);
        setError("Failed to load app");
      } finally {
        setLoading(false);
      }
    }

    if (appId) {
      loadApp();
    }
  }, [appId]);

  const getDisplayName = (app) => {
    return app.ownerName || app.ownerId?.substring(0, 8) + "..." || "Anonymous";
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstall = () => {
    setInstalling(true);
    // Simulate install process
    setTimeout(() => {
      setInstalling(false);
      alert("App installation feature coming soon!");
    }, 1500);
  };

  if (loading) {
    return (
      <main className="min-h-screen relative overflow-x-hidden">
        {/* Subtle Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="bg-orb bg-orb-purple w-96 h-96 top-1/4 left-1/4 opacity-10"></div>
          <div className="bg-orb bg-orb-blue w-96 h-96 bottom-1/4 right-1/4 opacity-10" style={{animationDelay: '7s'}}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          <TopNav />
          <div className="mt-8 bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-16 text-center shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-pulse">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="text-white text-lg">Loading app details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !app) {
    return (
      <main className="min-h-screen relative overflow-x-hidden">
        {/* Subtle Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="bg-orb bg-orb-purple w-96 h-96 top-1/4 left-1/4 opacity-10"></div>
          <div className="bg-orb bg-orb-pink w-96 h-96 bottom-1/4 right-1/4 opacity-10" style={{animationDelay: '7s'}}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          <TopNav />
          <div className="mt-8 bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-16 text-center shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-fade-up">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
              <span className="text-6xl">❌</span>
            </div>
            <p className="text-white text-2xl font-semibold mb-2">{error || "App not found"}</p>
            <p className="text-white/60 mb-6">This app may have been removed or doesn't exist.</p>
            <button
              onClick={() => router.push("/store")}
              className="px-8 py-4 bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white font-semibold rounded-full hover:from-purple-500 hover:to-blue-500 hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/30 backdrop-blur-md border border-white/10"
            >
              Back to Store
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Subtle Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-96 h-96 top-1/4 left-1/4 opacity-10"></div>
        <div className="bg-orb bg-orb-blue w-96 h-96 bottom-1/4 right-1/4 opacity-10" style={{animationDelay: '7s'}}></div>
        <div className="bg-orb bg-orb-purple w-80 h-80 top-1/2 right-1/3 opacity-10" style={{animationDelay: '14s'}}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <TopNav />

        {/* Back Button */}
        <div className="mt-8 mb-6 animate-fade-up">
          <button
            onClick={() => router.push("/store")}
            className="px-6 py-3 bg-white/10 border border-white/20 backdrop-blur-md rounded-full text-white font-semibold hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Store</span>
          </button>
        </div>

        {/* Cover Image */}
        {app.coverUrl && (
          <div className="w-full h-80 rounded-3xl mb-8 overflow-hidden shadow-2xl shadow-purple-500/30 animate-fade-up delay-100">
            <img
              src={app.coverUrl}
              alt={app.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* App Header Card */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-8 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] mb-8 animate-fade-up delay-200">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200">
                {app.title}
              </h1>

              {/* Creator Info */}
              <div className="flex items-center gap-4 text-white/70 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                  {getDisplayName(app)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{getDisplayName(app)}</p>
                  <TimeAgo timestamp={app.createdAt} prefix="Published " className="text-sm text-white/60 block" />
                </div>
              </div>

              {app.description && (
                <p className="text-white/80 text-lg leading-relaxed">
                  {app.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 md:min-w-[200px]">
              <button
                onClick={handleInstall}
                disabled={installing}
                className="px-8 py-4 bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white font-bold rounded-full hover:from-purple-500 hover:to-blue-500 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-md border border-white/10"
              >
                {installing ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Install App</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyUrl}
                className="px-8 py-4 bg-white/10 border border-white/20 backdrop-blur-md text-white font-semibold rounded-full hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]"
              >
                {copied ? "✓ Copied!" : "Share App"}
              </button>
            </div>
          </div>
        </div>

        {/* Build Information */}
        {build && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Original Prompt */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-8 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-fade-up delay-300">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">💭</span>
                <span>Original Prompt</span>
              </h2>
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <p className="text-white/90 whitespace-pre-wrap leading-relaxed font-mono text-sm">
                  {build.prompt}
                </p>
              </div>
            </div>

            {/* Build Steps */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-8 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-fade-up delay-400">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">⚙️</span>
                <span>Build Steps</span>
              </h2>
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 max-h-96 overflow-y-auto custom-scrollbar">
                {build.steps && build.steps.length > 0 ? (
                  <div className="space-y-2">
                    {build.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span className="text-green-400 font-bold mt-0.5">✓</span>
                        <span className="text-green-300/90 font-mono flex-1">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/50">No build steps recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Additional Info Card */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-8 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-fade-up delay-500">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">ℹ️</span>
            <span>App Information</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-white/60 text-sm mb-2">App ID</p>
              <p className="text-white font-mono text-sm break-all">{app.id}</p>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-white/60 text-sm mb-2">Build ID</p>
              <p className="text-white font-mono text-sm break-all">{app.buildId || "N/A"}</p>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-white/60 text-sm mb-2">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-white font-semibold capitalize">{app.status || "Published"}</p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-white/60 text-sm mb-2">Created</p>
              <p className="text-white">
                {app.createdAt ? new Date(app.createdAt.toDate()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : "Unknown"}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-16"></div>
      </div>

      {/* Custom Styles */}
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

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-400 {
          animation-delay: 400ms;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }

        .delay-2000 {
          animation-delay: 2000ms;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </main>
  );
}
