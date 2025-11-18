/**
 * VibeCode Build Pipeline - Main Build Page
 *
 * Flow:
 * 1. User enters app idea and selects target platform (web/ios/android/multi)
 * 2. Creates Firestore build doc → calls /api/build-app
 * 3. /api/build-app generates blueprint using LLM (src/lib/llmProvider.ts)
 * 4. Real-time logs stream from Firestore (via onSnapshot subscription)
 * 5. Live preview renders the blueprint at /preview/[buildId]
 * 6. Completed builds can be published (stub: src/lib/publisher.ts)
 */

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import TopNav from "@/components/TopNav";
import PublishDialog from "@/components/PublishDialog";
import TimeAgo from "@/components/TimeAgo";
import { onAuthChange } from "@/lib/firebase";
import { subscribeToUserBuilds, subscribeToBuildLogs, publishApp, createBuild } from "@/lib/firestore";
import { useUI } from "@/store/useUI";
import { authFetch } from "@/lib/authFetch";
import { triggerDownload } from "@/lib/builderClient";

export default function Build() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [target, setTarget] = useState("web");
  const [builds, setBuilds] = useState([]);
  const [buildLogs, setBuildLogs] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [toast, setToast] = useState(null);
  const logsEndRef = useRef(null);
  const promptRef = useRef(null);

  // Zustand state
  const {
    selectedBuildId,
    setSelectedBuildId,
    isPublishModalOpen,
    publishingBuildId,
    isPublishing,
    openPublishModal,
    closePublishModal,
    setIsPublishing,
  } = useUI();

  // Publish form state
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDescription, setPublishDescription] = useState("");
  const [publishCoverUrl, setPublishCoverUrl] = useState("");

  const userId = user?.uid || null;

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user's builds (Firestore real-time)
  useEffect(() => {
    if (!userId) {
      setBuilds([]);
      return;
    }

    const unsubscribe = subscribeToUserBuilds(userId, (userBuilds) => {
      console.log('Builds received:', userBuilds.map(b => ({ id: b.id, status: b.status, prompt: b.prompt })));
      setBuilds(userBuilds);
    });

    return () => unsubscribe();
  }, [userId]);

  // Subscribe to build logs for selected build (Firestore real-time)
  useEffect(() => {
    if (!selectedBuildId || !userId) {
      setBuildLogs([]);
      return;
    }

    const unsubscribe = subscribeToBuildLogs(selectedBuildId, userId, (logs) => {
      console.log(`Logs received for build ${selectedBuildId}:`, logs.length);
      setBuildLogs(logs);
    });

    return () => unsubscribe();
  }, [selectedBuildId, userId]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [buildLogs]);

  // Derive selectedBuild from builds array
  const selectedBuild = selectedBuildId ? builds.find(b => b.id === selectedBuildId) : null;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startBuild = async () => {
    if (!user) {
      showToast("Please sign in first", "error");
      return;
    }

    if (!prompt.trim()) {
      showToast("Please enter a prompt", "error");
      return;
    }

    setIsBuilding(true);

    try {
      const buildId = nanoid();

      console.log('Starting VibeCode build:', { buildId, userId, target, prompt: prompt.substring(0, 50) });

      // Create build document in Firestore
      await createBuild({
        buildId,
        userId,
        prompt: prompt.trim()
      });

      console.log('Build document created in Firestore');

      // Call new VibeCode build API with auth token
      const r = await authFetch("/api/build-app", {
        method: "POST",
        body: JSON.stringify({
          buildId,
          userId,
          prompt: prompt.trim(),
          target
        })
      });

      const { success, buildId: returnedBuildId } = await r.json();
      console.log('VibeCode build started:', { success, buildId: returnedBuildId });

      setSelectedBuildId(buildId);
      setPrompt("");
      showToast("VibeCode build started! Watch the logs below.");

      // Firestore will update in real-time via subscription
      setIsBuilding(false);
    } catch (error) {
      console.error("Build error:", error);
      showToast(error.message || "Build failed", "error");
      setIsBuilding(false);
    }
  };

  const selectBuild = (build) => {
    setSelectedBuildId(build.id);
  };

  const handleRemixBuild = (build) => {
    setPrompt(build.prompt);
    promptRef.current?.focus();
    showToast("Prompt loaded! Edit and build again.");
  };

  const handleOpenPublishModal = (build) => {
    setPublishTitle(build.prompt.substring(0, 50));
    setPublishDescription("");
    setPublishCoverUrl("");
    openPublishModal(build.id);
  };

  const handlePublish = async ({ title, description }) => {
    if (!user || !publishingBuildId) return;

    setIsPublishing(true);

    try {
      const appId = await publishApp(publishingBuildId, {
        title,
        description,
        ownerUid: user.uid,
        ownerName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        coverUrl: publishCoverUrl,
      });

      closePublishModal();
      setPublishTitle("");
      setPublishDescription("");
      setPublishCoverUrl("");

      showToast("Published successfully! Redirecting...");
      setTimeout(() => router.push(`/profile/apps`), 1000);
    } catch (error) {
      console.error("Publish error:", error);
      showToast(error.message || "Failed to publish", "error");
      throw error;
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownload = async (build) => {
    try {
      showToast("Preparing download...");
      await triggerDownload(build.id, build.appName || 'app');
      showToast("Downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      showToast(error.message || "Failed to download", "error");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      queued: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
      running: "bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse",
      complete: "bg-green-500/20 text-green-300 border border-green-500/40",
      failed: "bg-red-500/20 text-red-300 border border-red-500/40"
    };
    const labels = {
      queued: "⏳ Queued",
      running: "⚙️ Building",
      complete: "✓ Complete",
      failed: "✗ Failed"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Subtle Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-96 h-96 top-1/4 left-1/4 opacity-10"></div>
        <div className="bg-orb bg-orb-pink w-96 h-96 bottom-1/4 right-1/4 opacity-10" style={{animationDelay: '5s'}}></div>
        <div className="bg-orb bg-orb-blue w-80 h-80 top-1/2 right-1/3 opacity-10" style={{animationDelay: '10s'}}></div>
      </div>

      {/* TopNav */}
      <div className="relative z-10 py-8">
        <TopNav />
      </div>

      {/* ========== HERO SECTION ========== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
        {/* Page Header */}
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="h1 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200">
            Build Real Apps with AI
          </h1>
          <p className="sub max-w-2xl mx-auto">
            Describe your vision → Get a full-stack app with auth, database, and payments. Deploy-ready in minutes.
          </p>
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {/* LEFT - Prompt + My Builds */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prompt Section */}
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="h3 mb-4">Build Your App</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    App Idea
                  </label>
                  <textarea
                    ref={promptRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Finance tracker with charts, user auth, Stripe payments, real-time database..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none custom-scrollbar"
                    rows="6"
                    disabled={isBuilding}
                  />
                </div>

                {/* Target Platform Selector */}
                <div>
                  <label className="block text-white/90 text-sm font-semibold mb-2">
                    Target Platform
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "web", icon: "🌐", label: "Web App" },
                      { value: "ios", icon: "📱", label: "iOS" },
                      { value: "android", icon: "🤖", label: "Android" },
                      { value: "multi", icon: "🚀", label: "Multi-Platform" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTarget(option.value)}
                        disabled={isBuilding}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          target === option.value
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                            : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startBuild}
                  disabled={isBuilding || !user}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-md border border-white/10"
                >
                  {isBuilding ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Building...</span>
                    </>
                  ) : !user ? (
                    <span>🔒 Sign in to Build</span>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Build App</span>
                    </>
                  )}
                </button>

                {/* Tips */}
                <div className="text-white/50 text-xs space-y-1 pt-2">
                  <p className="font-semibold text-white/60">💡 Tips for better prompts:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>Specify user screens & flows</li>
                    <li>Mention database schema</li>
                    <li>Include auth & payment needs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* My Builds */}
            <div className="glass-card p-6 animate-fade-in" style={{animationDelay: '100ms'}}>
              <h3 className="text-xl font-bold text-white mb-4">
                My Builds ({builds.length})
              </h3>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {!user ? (
                  <div className="text-center py-8">
                    <p className="text-white/50 text-sm">Sign in to see your builds</p>
                  </div>
                ) : builds.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                      <span className="text-3xl">🚀</span>
                    </div>
                    <p className="text-white/50 text-sm">No builds yet</p>
                    <p className="text-white/30 text-xs mt-1">Start building your first app!</p>
                  </div>
                ) : (
                  builds.map((build) => (
                    <div
                      key={build.id}
                      className={`p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                        selectedBuildId === build.id
                          ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/30 shadow-lg shadow-purple-500/20"
                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}
                      onClick={() => selectBuild(build)}
                    >
                      <div className="mb-3">
                        <p className="text-white font-medium text-sm line-clamp-2 mb-2">
                          {build.prompt.length > 60
                            ? build.prompt.substring(0, 60) + "..."
                            : build.prompt}
                        </p>
                        <div className="flex items-center gap-2 justify-between">
                          {getStatusBadge(build.status)}
                          <TimeAgo timestamp={build.createdAt} className="text-white/40 text-xs" />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemixBuild(build);
                          }}
                          className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all"
                        >
                          🔄 Remix
                        </button>
                        {build.status === "complete" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(build);
                              }}
                              className="flex-1 px-3 py-2 bg-green-500/80 hover:bg-green-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md backdrop-blur-md"
                            >
                              ⬇️ Download
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPublishModal(build);
                              }}
                              className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md backdrop-blur-md"
                            >
                              📤 Publish
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE - Build Logs */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 h-full animate-fade-in" style={{animationDelay: '200ms'}}>
              <h2 className="h3 mb-4">Build Logs</h2>

              <div className="glass-panel p-4 h-[calc(100%-4rem)] overflow-y-auto custom-scrollbar">
                {buildLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-20 h-20 mb-4 bg-white/5 rounded-full flex items-center justify-center">
                      <span className="text-4xl">📋</span>
                    </div>
                    <p className="text-white/50 text-sm">No logs yet</p>
                    <p className="text-white/30 text-xs mt-1">
                      Select a build or start a new one
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {buildLogs.map((log) => (
                      <div
                        key={log.id}
                        className="text-green-400 leading-relaxed hover:bg-white/5 px-2 py-1 rounded transition-colors"
                      >
                        {log.message}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT - Live Preview */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 h-full animate-fade-in" style={{animationDelay: '300ms'}}>
              <h2 className="h3 mb-4">Live Preview</h2>

              <div className="glass-panel rounded-2xl border border-white/10 h-[calc(100%-4rem)] overflow-hidden">
                {!selectedBuild ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-24 h-24 mb-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full flex items-center justify-center">
                      <span className="text-6xl">👁️</span>
                    </div>
                    <p className="text-white text-lg font-semibold mb-2">
                      No preview yet
                    </p>
                    <p className="text-white/50 text-sm">
                      Build an app to see a live preview
                    </p>
                  </div>
                ) : selectedBuild.status === "complete" ? (
                  <iframe
                    src={`/preview/${selectedBuild.id}`}
                    className="w-full h-full rounded-xl"
                    title="App Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-20 h-20 mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-5xl">⚙️</span>
                    </div>
                    <p className="text-white text-lg font-semibold mb-2">
                      Generating UI...
                    </p>
                    <p className="text-white/50 text-sm mb-6">
                      Building your app from your idea
                    </p>
                    {/* Skeleton */}
                    <div className="w-full max-w-xs space-y-4 animate-pulse">
                      <div className="h-12 bg-white/10 rounded-lg"></div>
                      <div className="h-32 bg-white/10 rounded-lg"></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-24 bg-white/10 rounded-lg"></div>
                        <div className="h-24 bg-white/10 rounded-lg"></div>
                      </div>
                      <div className="h-10 bg-white/10 rounded-lg"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== UNDER-HERO SECTIONS ========== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16 space-y-20">
        {/* How It Works */}
        <section className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="h2 mb-4">How VibelyBuild.AI Works</h2>
            <p className="sub max-w-2xl mx-auto">
              From idea to deployed app in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: "✍️",
                title: "Describe Your App",
                description: "Tell us what you want to build. Include screens, features, database structure, auth requirements, and payment integration."
              },
              {
                step: "2",
                icon: "⚡",
                title: "Watch It Build Live",
                description: "Our AI generates full-stack code in real-time. See logs streaming, preview the UI, and track progress as your app comes to life."
              },
              {
                step: "3",
                icon: "🚀",
                title: "Publish & Grow",
                description: "Deploy to our store, share with the community, use AI ads to market it, and connect with users via messenger."
              }
            ].map((item, i) => (
              <div key={i} className="glass-card p-8 text-center relative hover:scale-105 transition-transform duration-300 group">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all">
                  <span className="text-4xl">{item.icon}</span>
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  {item.step}
                </div>
                <h3 className="h3 text-xl mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Power Features */}
        <section className="animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="h2 mb-4">Power Features</h2>
            <p className="sub max-w-2xl mx-auto">
              Everything you need to build, market, and monetize
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🏗️",
                title: "App Builder",
                description: "Full-stack apps from a single prompt. Auth, database, payments included."
              },
              {
                icon: "📢",
                title: "AI Ads & Marketing",
                description: "Generate ad creatives, campaigns, and marketing copy instantly."
              },
              {
                icon: "💬",
                title: "Community & Messenger",
                description: "Share builds, get feedback, message other builders in real-time."
              },
              {
                icon: "🛍️",
                title: "Store & Monetization",
                description: "Publish apps to our marketplace and start earning."
              }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6 hover:bg-white/10 transition-all duration-300 group">
                <div className="w-14 h-14 mb-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h4 className="text-white font-bold text-lg mb-2">{feature.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 60 Second Guide */}
        <section className="animate-fade-in">
          <div className="glass-section text-center p-12">
            <h2 className="h2 mb-4">Using VibelyBuild in 60 Seconds</h2>
            <p className="sub max-w-2xl mx-auto mb-8">
              Quick start guide to get your first app live
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
              {["Sign In", "Describe App", "Watch Build", "Preview", "Publish"].map((step, i) => (
                <div key={i} className="flex items-center">
                  <div className="bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    {i + 1}
                  </div>
                  <div className="ml-3 text-left">
                    <p className="text-white font-semibold text-sm">{step}</p>
                  </div>
                  {i < 4 && (
                    <div className="hidden md:block mx-4 text-white/30 text-2xl">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Spacing */}
      <div className="h-16"></div>

      {/* Publish Modal */}
      <PublishDialog
        open={isPublishModalOpen}
        onClose={closePublishModal}
        onConfirm={handlePublish}
        buildPrompt={selectedBuild?.prompt}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              toast.type === "success"
                ? "bg-green-500/90 border-green-400/50 text-white"
                : "bg-red-500/90 border-red-400/50 text-white"
            }`}
          >
            <p className="font-semibold">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
