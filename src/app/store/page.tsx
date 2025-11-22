"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import { getAppsFromStore, searchApps, filterAppsByTarget, sortApps, StoreApp } from "@/lib/store/getApps";
import { formatPublishedDate, getAuthorName } from "@/lib/store/getAppDetails";
import Image from "next/image";

export default function StorePage() {
  const router = useRouter();
  const [apps, setApps] = useState<StoreApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<StoreApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"publishedAt" | "views" | "likes">("publishedAt");

  // Fetch apps on mount
  useEffect(() => {
    fetchApps();
  }, []);

  // Apply filters whenever search, filter, or sort changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedFilter, sortBy, apps]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const fetchedApps = await getAppsFromStore({
        limit: 100,
        orderByField: "publishedAt",
        orderDirection: "desc",
      });
      setApps(fetchedApps);
    } catch (error) {
      console.error("Failed to fetch apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...apps];

    // Apply search
    result = searchApps(result, searchTerm);

    // Apply platform filter
    result = filterAppsByTarget(result, selectedFilter === "all" ? null : selectedFilter);

    // Apply sorting
    result = sortApps(result, sortBy, "desc");

    setFilteredApps(result);
  };

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

      {/* Store Content */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-12 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border-2 border-purple-500/50 rounded-full px-5 py-2.5 mb-6 backdrop-blur-sm">
            <span className="text-2xl">🏪</span>
            <span className="text-purple-200 font-bold text-sm tracking-wide">VIBELYBUILD STORE</span>
          </div>

          <h1 className="h1 mb-4">
            Discover Amazing <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400">AI-Built Apps</span>
          </h1>

          <p className="sub max-w-2xl mx-auto">
            Explore apps built by the VibelyBuild AI community. Download, remix, and get inspired!
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-section max-w-5xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search Bar */}
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Search apps by name or description..."
                className="w-full bg-white/5 text-white placeholder-white/40 px-5 py-3 rounded-2xl outline-none border border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
            </div>

            {/* Platform Filter */}
            <div className="flex gap-2 flex-wrap lg:flex-nowrap">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedFilter === "all"
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                }`}
              >
                All Apps
              </button>
              <button
                onClick={() => setSelectedFilter("web")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedFilter === "web"
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                }`}
              >
                🌐 Web
              </button>
              <button
                onClick={() => setSelectedFilter("ios")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedFilter === "ios"
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                }`}
              >
                📱 iOS
              </button>
              <button
                onClick={() => setSelectedFilter("multi")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedFilter === "multi"
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                }`}
              >
                🚀 Multi-Platform
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/10 text-white px-4 py-3 rounded-2xl outline-none border border-white/20 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all cursor-pointer"
            >
              <option value="publishedAt" className="bg-gray-900">Newest</option>
              <option value="views" className="bg-gray-900">Most Viewed</option>
              <option value="likes" className="bg-gray-900">Most Liked</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-white/60 text-sm">
              {loading ? (
                "Loading apps..."
              ) : (
                <>
                  Showing <strong className="text-white">{filteredApps.length}</strong> of{" "}
                  <strong className="text-white">{apps.length}</strong> apps
                </>
              )}
            </p>

            <button
              onClick={fetchApps}
              className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Apps Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="glass-card p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white/70">Loading amazing apps...</p>
            </div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="glass-card p-12 text-center max-w-md">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="h3 mb-2">No apps found</h3>
              <p className="text-white/60 mb-6">
                {searchTerm
                  ? `No apps match "${searchTerm}"`
                  : "No apps in the store yet. Be the first to publish!"}
              </p>
              <button
                onClick={() => router.push("/build")}
                className="gradient-btn"
              >
                Build Your App ✨
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredApps.map((app) => (
              <div
                key={app.appId}
                onClick={() => router.push(`/store/app/${app.appId}`)}
                className="glass-card p-0 overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 group"
              >
                {/* Screenshot */}
                <div className="relative w-full h-48 bg-gradient-to-br from-purple-500/20 to-blue-500/20 overflow-hidden">
                  {app.screenshotUrl ? (
                    <Image
                      src={app.screenshotUrl}
                      alt={app.appName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-6xl opacity-30">📱</span>
                    </div>
                  )}

                  {/* Platform Badge */}
                  {app.target && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                      {app.target === "web" && "🌐 Web"}
                      {app.target === "ios" && "📱 iOS"}
                      {app.target === "android" && "🤖 Android"}
                      {app.target === "multi" && "🚀 Multi"}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* App Name */}
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
                    {app.appName}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">
                    {app.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-white/50 mb-3">
                    <span className="truncate mr-2">{getAuthorName(app.userId)}</span>
                    <span className="whitespace-nowrap">{formatPublishedDate(app.publishedAt)}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <div className="flex items-center gap-1">
                      <span>👁️</span>
                      <span>{app.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>❤️</span>
                      <span>{app.likes || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!loading && filteredApps.length > 0 && (
          <div className="glass-section max-w-3xl mx-auto mt-16 text-center">
            <h2 className="h2 mb-4">Ready to Build Your Own?</h2>
            <p className="text-white/70 mb-6">
              Join thousands of creators building apps with AI. No coding required.
            </p>
            <button
              onClick={() => router.push("/build")}
              className="gradient-btn text-lg px-8 py-4"
            >
              Start Building Now ✨
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
