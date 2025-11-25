"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import {
  getAppDetails,
  incrementAppViews,
  incrementAppLikes,
  hasUserLikedApp,
  markAppAsLiked,
  formatPublishedDate,
  formatFileSize,
  getAuthorName,
  AppDetails,
} from "@/lib/store/getAppDetails";
import Image from "next/image";

interface PageProps {
  params: {
    appId: string;
  };
}

export default function AppDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { appId } = params;

  const [app, setApp] = useState<AppDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);

  useEffect(() => {
    if (appId) {
      fetchAppDetails();
      // Increment view count (fire and forget)
      incrementAppViews(appId);
    }
  }, [appId]);

  useEffect(() => {
    // Check if user has already liked this app
    setLiked(hasUserLikedApp(appId));
  }, [appId]);

  const fetchAppDetails = async () => {
    setLoading(true);
    try {
      const appData = await getAppDetails(appId);
      if (appData) {
        setApp(appData);
        setLocalLikes(appData.likes || 0);
      }
    } catch (error) {
      console.error("Failed to fetch app details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liked || liking) return;

    setLiking(true);

    try {
      const success = await incrementAppLikes(appId);

      if (success) {
        setLiked(true);
        setLocalLikes((prev) => prev + 1);
        markAppAsLiked(appId);
      }
    } catch (error) {
      console.error("Failed to like app:", error);
    } finally {
      setLiking(false);
    }
  };

  const handleDownload = () => {
    if (!app?.bundleUrl) return;

    // Trigger download
    const link = document.createElement("a");
    link.href = app.bundleUrl;
    link.download = `${app.appName.replace(/\s+/g, "_")}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = () => {
    if (!app?.previewUrl) return;
    window.open(app.previewUrl, "_blank");
  };

  if (loading) {
    return (
      <main className="min-h-screen relative overflow-x-hidden">
        {/* PRE-BETA LAUNCH Banner */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-3 px-4 text-center font-bold text-sm shadow-lg">
          <div className="flex items-center justify-center gap-2 animate-pulse">
            <span className="text-xl">🚀</span>
            <span>PRE-BETA LAUNCH – Official Beta Coming Soon</span>
          </div>
        </div>

        {/* TopNav */}
        <div className="relative z-10 pt-16 pb-8">
          <TopNav />
        </div>

        {/* Loading State */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="glass-card p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white/70">Loading app details...</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!app) {
    return (
      <main className="min-h-screen relative overflow-x-hidden">
        {/* PRE-BETA LAUNCH Banner */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-3 px-4 text-center font-bold text-sm shadow-lg">
          <div className="flex items-center justify-center gap-2 animate-pulse">
            <span className="text-xl">🚀</span>
            <span>PRE-BETA LAUNCH – Official Beta Coming Soon</span>
          </div>
        </div>

        {/* TopNav */}
        <div className="relative z-10 pt-16 pb-8">
          <TopNav />
        </div>

        {/* Not Found State */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="glass-card p-12 text-center max-w-md">
              <span className="text-6xl mb-4 block">❌</span>
              <h2 className="h2 mb-4">App Not Found</h2>
              <p className="text-white/60 mb-6">
                This app doesn't exist or has been removed.
              </p>
              <button onClick={() => router.push("/store")} className="gradient-btn">
                Browse Store
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* PRE-BETA LAUNCH Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-3 px-4 text-center font-bold text-sm shadow-lg">
        <div className="flex items-center justify-center gap-2 animate-pulse">
          <span className="text-xl">🚀</span>
          <span>PRE-BETA LAUNCH – Official Beta Coming Soon</span>
        </div>
      </div>

      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-12"></div>
        <div className="bg-orb bg-orb-pink w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-12" style={{animationDelay: '7s'}}></div>
        <div className="bg-orb bg-orb-blue w-[400px] h-[400px] top-1/2 right-1/3 opacity-10" style={{animationDelay: '14s'}}></div>
      </div>

      {/* TopNav */}
      <div className="relative z-10 pt-16 pb-8">
        <TopNav />
      </div>

      {/* App Details Content */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12 animate-fade-in">
        {/* Back Button */}
        <button
          onClick={() => router.push("/store")}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
        >
          <span>←</span>
          <span className="font-semibold">Back to Store</span>
        </button>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Screenshot */}
          <div className="lg:col-span-2">
            <div className="glass-card p-0 overflow-hidden mb-6">
              <div className="relative w-full aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                {app.screenshotUrl ? (
                  <Image
                    src={app.screenshotUrl}
                    alt={app.appName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-9xl opacity-30">📱</span>
                  </div>
                )}

                {/* Platform Badge */}
                {app.target && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/20">
                    {app.target === "web" && "🌐 Web App"}
                    {app.target === "ios" && "📱 iOS App"}
                    {app.target === "android" && "🤖 Android App"}
                    {app.target === "multi" && "🚀 Multi-Platform"}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="glass-section">
              <h2 className="h3 mb-4">About This App</h2>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {app.description}
              </p>
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Title & Author */}
            <div className="glass-card">
              <h1 className="h2 mb-3">{app.appName}</h1>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                <span>👤</span>
                <span>{getAuthorName(app.userId)}</span>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <span>📅</span>
                <span>Published {formatPublishedDate(app.publishedAt)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-card">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{app.views || 0}</div>
                  <div className="text-white/60 text-sm">👁️ Views</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{localLikes}</div>
                  <div className="text-white/60 text-sm">❤️ Likes</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="glass-card space-y-3">
              <button
                onClick={handlePreview}
                className="w-full gradient-btn text-center py-4 text-lg"
              >
                🎨 Live Preview
              </button>

              <button
                onClick={handleDownload}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 rounded-full transition-all border border-white/20 hover:border-white/30"
              >
                📦 Download ({formatFileSize(app.bundleSize)})
              </button>

              <button
                onClick={handleLike}
                disabled={liked || liking}
                className={`w-full py-4 rounded-full font-semibold transition-all border ${
                  liked
                    ? "bg-red-500/30 text-red-200 border-red-500/50 cursor-not-allowed"
                    : liking
                    ? "bg-white/10 text-white/50 border-white/20 cursor-wait"
                    : "bg-white/10 hover:bg-red-500/20 text-white border-white/20 hover:border-red-500/30"
                }`}
              >
                {liked ? "❤️ Liked!" : liking ? "⏳ Liking..." : "🤍 Like This App"}
              </button>
            </div>

            {/* Additional Info */}
            <div className="glass-card">
              <h3 className="text-white font-semibold mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>App ID:</span>
                  <span className="font-mono text-xs">{app.appId.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>File Size:</span>
                  <span>{formatFileSize(app.bundleSize)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Platform:</span>
                  <span>{app.target || "Unknown"}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Status:</span>
                  <span className="text-green-400 font-semibold">Published</span>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="glass-card">
              <h3 className="text-white font-semibold mb-3">Share</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={app.storeUrl}
                  readOnly
                  className="flex-1 bg-white/5 text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(app.storeUrl);
                    alert("Copied to clipboard!");
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all border border-white/20 text-sm font-semibold"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="glass-section max-w-3xl mx-auto mt-16 text-center">
          <h2 className="h2 mb-4">Want to Build Something Similar?</h2>
          <p className="text-white/70 mb-6">
            Use VibelyBuild AI to create your own custom apps in minutes.
          </p>
          <button
            onClick={() => router.push("/build")}
            className="gradient-btn text-lg px-8 py-4"
          >
            Start Building ✨
          </button>
        </div>
      </section>
    </main>
  );
}
