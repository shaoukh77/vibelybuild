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
import BetaRibbon from "@/components/BetaRibbon";
import PreBetaNotice from "@/components/PreBetaNotice";
import Footer from "@/components/Footer";
import PublishDialog from "@/components/PublishDialog";
import PaywallPopup from "@/components/PaywallPopup";
import TimeAgo from "@/components/TimeAgo";
import { onAuthChange } from "@/lib/firebase";
import { publishApp } from "@/lib/firestore";
import { useUI } from "@/store/useUI";
import { authFetch } from "@/lib/authFetch";
import { triggerDownload } from "@/lib/builderClient";
import { LivePreviewPanel } from "@/app/build/livePreviewPanel";
import { fetchPreviewUrl } from "@/lib/api/fetchPreview";
import { canCreateBuild } from "@/lib/user/userPlan";

export default function Build() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [target, setTarget] = useState("web");
  const [builds, setBuilds] = useState([]);
  const [buildLogs, setBuildLogs] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [toast, setToast] = useState(null);
  const [buildComplete, setBuildComplete] = useState(false);
  const [fileTree, setFileTree] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uiReadyUrl, setUiReadyUrl] = useState(null); // PHASE 3: Listen for ui_ready event
  const [previewStatus, setPreviewStatus] = useState('waiting'); // waiting, preparing, ready
  const [isTrial, setIsTrial] = useState(false);
  const [dailyBuildsRemaining, setDailyBuildsRemaining] = useState(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [deletingBuildId, setDeletingBuildId] = useState(null);
  const logsEndRef = useRef(null);
  const promptRef = useRef(null);
  const buildDebounceRef = useRef(null);

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

  // Check trial status when user changes
  useEffect(() => {
    if (user?.uid) {
      checkTrialStatus();
    }
  }, [user]);

  const checkTrialStatus = async () => {
    if (!user?.uid) return;

    try {
      const status = await canCreateBuild(user.uid);
      setIsTrial(status.isTrial || false);
      setDailyBuildsRemaining(status.dailyBuildsRemaining ?? null);
    } catch (error) {
      console.error('Error checking trial status:', error);
    }
  };

  // Note: We're now using the BuildOrchestrator system
  // Builds are stored in-memory on the backend and in .cache/
  // For now, we'll just track the current build in state
  // TODO: Add a /api/build/list endpoint if we need to persist builds

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

  // Debounced build function (800ms debounce)
  const debouncedStartBuild = () => {
    if (buildDebounceRef.current) {
      clearTimeout(buildDebounceRef.current);
    }

    buildDebounceRef.current = setTimeout(() => {
      startBuild();
    }, 800);

    showToast("Build scheduled... (800ms debounce)", "info");
  };

  // Delete build handler
  const handleDeleteBuild = async (buildId) => {
    if (!confirm('Are you sure you want to delete this build? This cannot be undone.')) {
      return;
    }

    setDeletingBuildId(buildId);

    try {
      const response = await authFetch(`/api/build/delete?projectId=${buildId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete build');
      }

      // Remove from UI
      setBuilds(prev => prev.filter(b => b.id !== buildId));

      // Clear selection if deleted build was selected
      if (selectedBuildId === buildId) {
        setSelectedBuildId(null);
      }

      showToast('Build deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      showToast(error.message || 'Failed to delete build', 'error');
    } finally {
      setDeletingBuildId(null);
    }
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

    // Check build limits
    try {
      const buildCheck = await canCreateBuild(user.uid);

      if (!buildCheck.allowed) {
        showToast(buildCheck.reason || "Build limit reached", "error");
        return;
      }

      // Update remaining builds display
      setDailyBuildsRemaining(buildCheck.dailyBuildsRemaining ?? null);
    } catch (error) {
      console.error('Error checking build limits:', error);
      showToast("Error checking build limits. Please try again.", "error");
      return;
    }

    setIsBuilding(true);
    setBuildLogs([]); // Clear previous logs
    setBuildComplete(false);
    setFileTree(null);
    setPreviewUrl(null); // Clear previous preview URL
    setUiReadyUrl(null); // Clear previous UI ready URL
    setPreviewStatus('waiting');

    try {
      console.log('Starting VibeCode build:', { target, prompt: prompt.substring(0, 50) });

      // Call new BuildOrchestrator API
      const r = await authFetch("/api/build/start", {
        method: "POST",
        body: JSON.stringify({
          prompt: prompt.trim(),
          target
        })
      });

      const data = await r.json();

      if (!data.success) {
        throw new Error(data.error || 'Build failed to start');
      }

      const { jobId } = data;
      console.log('VibeCode build started:', { jobId, status: data.status });

      setSelectedBuildId(jobId);

      // Add to builds list for UI
      setBuilds(prev => [{
        id: jobId,
        prompt: prompt.trim(),
        target,
        status: 'running',
        createdAt: new Date(),
      }, ...prev]);

      setPrompt("");
      showToast("VibeCode build started! Watch the logs below.");

      // Start SSE log streaming
      startLogStream(jobId);

      setIsBuilding(false);
    } catch (error) {
      console.error("Build error:", error);
      showToast(error.message || "Build failed", "error");
      setIsBuilding(false);
    }
  };

  // SSE Log Streaming
  const startLogStream = async (jobId) => {
    try {
      const token = await user.getIdToken();
      const url = `/api/build/logs?jobId=${jobId}&token=${encodeURIComponent(token)}`;

      const eventSource = new EventSource(url);

      // Listen to "message" events for live logs
      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.log) {
            // Add log to state
            setBuildLogs(prev => [...prev, {
              id: nanoid(),
              message: data.log,
              level: data.status || 'info',
              timestamp: data.timestamp || Date.now(),
            }]);
          }
        } catch (err) {
          console.error('Failed to parse log message:', err);
        }
      });

      // Listen to "fileTree" event for real-time file tree updates
      eventSource.addEventListener('fileTree', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[SSE] Received fileTree event:', data);

          if (data.files) {
            setFileTree(data.files);
          }
        } catch (err) {
          console.error('Failed to parse fileTree event:', err);
        }
      });

      // Listen to "generatedFiles" event for file generation updates
      eventSource.addEventListener('generatedFiles', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[SSE] Received generatedFiles event:', data);

          if (data.files) {
            setFileTree(data.files);
          }
        } catch (err) {
          console.error('Failed to parse generatedFiles event:', err);
        }
      });

      // Listen to "preview_ready" event for preview URL
      eventSource.addEventListener('preview_ready', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[SSE] Received preview_ready event:', data);

          if (data.url) {
            setPreviewUrl(data.url);
            setPreviewStatus('preparing'); // Server started, waiting for compilation
          }
        } catch (err) {
          console.error('Failed to parse preview_ready event:', err);
        }
      });

      // PHASE 3: Listen to "ui_ready" event for when Next.js is fully compiled
      eventSource.addEventListener('ui_ready', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[SSE] Received ui_ready event:', data);

          if (data.url) {
            setUiReadyUrl(data.url);
            setPreviewStatus('ready'); // UI is fully compiled and interactive
            showToast("✅ Preview UI is fully ready and interactive!");
          }
        } catch (err) {
          console.error('Failed to parse ui_ready event:', err);
        }
      });

      // Listen to "done" event for completion
      eventSource.addEventListener('done', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Build complete:', data);
          eventSource.close();

          // Update build status in list
          setBuilds(prev => prev.map(b =>
            b.id === jobId
              ? { ...b, status: data.success ? 'complete' : 'failed' }
              : b
          ));

          if (data.success) {
            setBuildComplete(true);
            showToast("Build complete! Preview and download ready.");
          } else {
            showToast(data.error || "Build failed. Check logs for details.", "error");
          }
        } catch (err) {
          console.error('Failed to parse done message:', err);
        }
      });

      // Listen to "error" events
      eventSource.addEventListener('error', (event) => {
        try {
          if (event.data) {
            const data = JSON.parse(event.data);
            console.error('Build error:', data.error);
            showToast(data.error || "Build error occurred", "error");
          }
        } catch (err) {
          // Generic error without data
          console.error('SSE connection error');
        }
      });

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        showToast("Connection lost. Please refresh.", "error");
      };

    } catch (error) {
      console.error('Failed to start log stream:', error);
      showToast("Failed to start log stream", "error");
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
    // Check if user is on trial - block publishing
    if (isTrial) {
      setPaywallFeature('Publishing to Vibe Store');
      setIsPaywallOpen(true);
      return;
    }

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

  const handleDownload = async (jobId) => {
    try {
      showToast("Preparing download...");
      const token = await user.getIdToken();

      const response = await fetch(`/api/download/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `app-${jobId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

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
      {/* Beta Ribbon */}
      <BetaRibbon />

      {/* Pre-Beta Notice Banner */}
      <PreBetaNotice />

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
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="h1 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200">
            VibelyBuild.AI – Build Smarter Apps Automatically
          </h1>
          <p className="sub max-w-2xl mx-auto">
            Use AI to generate full-stack applications, deploy instantly, and scale without limits.
          </p>
        </div>

        {/* Beta Development Notice */}
        <div className="max-w-3xl mx-auto mb-8 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-5 backdrop-blur-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-orange-400 text-sm">⚠️</span>
            </div>
            <div className="text-left flex-1">
              <h3 className="text-orange-200 font-bold text-sm mb-1.5">Pre-Beta Testing Mode</h3>
              <p className="text-orange-100/80 text-xs leading-relaxed">
                Generated apps may not be fully functional yet — this builder is in early testing mode. Currently supporting <strong>Web Apps only</strong>. iOS and Android support coming soon.
              </p>
            </div>
          </div>
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {/* LEFT - Prompt + My Builds */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trial Mode Indicator */}
            {isTrial && dailyBuildsRemaining !== null && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-xl p-4 backdrop-blur-sm animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    <span className="text-yellow-200 font-bold text-sm">Trial Mode Active</span>
                  </div>
                  <span className="text-yellow-300 text-xs bg-yellow-500/20 px-2 py-1 rounded-full">
                    FREE
                  </span>
                </div>
                <p className="text-yellow-100/80 text-xs leading-relaxed">
                  {dailyBuildsRemaining > 0 ? (
                    <>
                      <strong>{dailyBuildsRemaining}/3</strong> builds remaining today
                    </>
                  ) : (
                    <>Daily limit reached. Resets tomorrow.</>
                  )}
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="mt-3 w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Upgrade to Starter →
                </button>
              </div>
            )}

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
                      { value: "web", icon: "🌐", label: "Web App", available: true },
                      { value: "ios", icon: "📱", label: "iOS", available: false },
                      { value: "android", icon: "🤖", label: "Android", available: false },
                      { value: "multi", icon: "🚀", label: "Multi-Platform", available: false }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => option.available && setTarget(option.value)}
                        disabled={isBuilding || !option.available}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
                          target === option.value && option.available
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                            : option.available
                            ? "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
                            : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                        {!option.available && (
                          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                            Unlocking in Beta
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    💡 Web Apps only during Pre-Beta. Mobile support launching with full Beta.
                  </p>
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

                      <div className="flex flex-col gap-2">
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(build.id);
                              }}
                              className="flex-1 px-3 py-2 bg-green-500/80 hover:bg-green-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md backdrop-blur-md"
                            >
                              ⬇️ Download
                            </button>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBuild(build.id);
                          }}
                          disabled={deletingBuildId === build.id}
                          className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-200 rounded-lg text-xs font-medium transition-all border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingBuildId === build.id ? '⏳ Deleting...' : '🗑️ Delete'}
                        </button>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="h3">Live Preview</h2>
                {/* Status badge */}
                {selectedBuildId && (
                  <div className="flex items-center gap-2">
                    {previewStatus === 'waiting' && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30">
                        ⏳ Waiting
                      </span>
                    )}
                    {previewStatus === 'preparing' && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 animate-pulse">
                        ⚙️ Preparing
                      </span>
                    )}
                    {previewStatus === 'ready' && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                        ✓ Ready
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="glass-panel rounded-2xl border border-white/10 h-[calc(100%-4rem)] overflow-hidden">
                <LivePreviewPanel
                  jobId={selectedBuildId}
                  buildComplete={buildComplete}
                  user={user}
                  fileTreeFromSSE={fileTree}
                  previewUrlFromSSE={previewUrl}
                  uiReadyUrl={uiReadyUrl}
                />
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

      {/* Footer */}
      <Footer />

      {/* Publish Modal */}
      <PublishDialog
        open={isPublishModalOpen}
        onClose={closePublishModal}
        onConfirm={handlePublish}
        buildPrompt={selectedBuild?.prompt}
      />

      {/* Paywall Popup */}
      <PaywallPopup
        open={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        feature={paywallFeature}
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
