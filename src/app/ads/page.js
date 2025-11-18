"use client";
import { useState, useEffect } from "react";
import TopNav from "@/components/TopNav";
import TimeAgo from "@/components/TimeAgo";
import { onAuthChange } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

// Placeholder function for Claude API call
function generateAd(prompt) {
  // This is a placeholder - will be replaced with actual Claude API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        script: `Scene 1: Opening Hook (0-3s)
[Camera on user, energetic music]
"Hey! Are you tired of [problem]? Let me show you something amazing!"

Scene 2: Problem Identification (3-8s)
[B-roll of common pain points]
"We all know how frustrating it is when ${prompt.description}..."

Scene 3: Solution Introduction (8-15s)
[Show product/app in action]
"That's why I started using ${prompt.title}. It's a game-changer for ${prompt.targetAudience}."

Scene 4: Benefits & Features (15-25s)
[Quick feature demos with text overlays]
✓ Easy to use
✓ Saves time
✓ Gets results fast

Scene 5: Call to Action (25-30s)
[User excited, showing results]
"Try it yourself - link in bio! You won't regret it!"`,
        caption: `🚀 Game-changer alert! ${prompt.title} is transforming how ${prompt.targetAudience} handle their daily tasks.

${prompt.description}

I've been using it for weeks and the results are incredible! 💯

Perfect for: ${prompt.targetAudience}
Platform: ${prompt.platform}

Ready to level up? Click the link in bio! 👆

#innovation #productivity #${prompt.platform.toLowerCase()} #tech #gamechange`,
        hooks: [
          `🔥 ${prompt.targetAudience} - this changes everything`,
          `💡 The secret that top ${prompt.targetAudience} don't want you to know`,
          `⚡ How I 10x my results with ${prompt.title}`,
        ],
      });
    }, 2000);
  });
}

export default function AIAdsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAudience: "",
    platform: "Facebook",
  });

  // Output state
  const [output, setOutput] = useState(null);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user's ads
  useEffect(() => {
    if (!currentUser) {
      setAds([]);
      return;
    }

    const adsRef = collection(db, "users", currentUser.uid, "ads");
    // Simplified query: no orderBy to avoid composite index - will sort client-side
    const q = query(adsRef, limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userAds = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort client-side by createdAt descending
      userAds.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setAds(userAds);
    }, (error) => {
      console.warn('Error loading ads:', error);
      setAds([]);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!currentUser) {
      showToast("Please sign in to generate ads", "error");
      return;
    }

    if (!formData.title || !formData.description || !formData.targetAudience) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      // Call placeholder generateAd function
      const result = await generateAd(formData);
      setOutput(result);

      // Save to Firestore
      const adsRef = collection(db, "users", currentUser.uid, "ads");
      await addDoc(adsRef, {
        title: formData.title,
        description: formData.description,
        targetAudience: formData.targetAudience,
        platform: formData.platform,
        script: result.script,
        caption: result.caption,
        hooks: result.hooks,
        createdAt: serverTimestamp(),
      });

      showToast("AI ad generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      showToast("Failed to generate ad. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  };

  const handleView = (ad) => {
    setSelectedAd(ad.id);
    setFormData({
      title: ad.title,
      description: ad.description,
      targetAudience: ad.targetAudience,
      platform: ad.platform,
    });
    setOutput({
      script: ad.script,
      caption: ad.caption,
      hooks: ad.hooks,
    });
  };

  const handleDelete = async (adId) => {
    if (!currentUser) return;

    try {
      const adRef = doc(db, "users", currentUser.uid, "ads", adId);
      await deleteDoc(adRef);
      if (selectedAd === adId) {
        setSelectedAd(null);
        setOutput(null);
        setFormData({
          title: "",
          description: "",
          targetAudience: "",
          platform: "Facebook",
        });
      }
      showToast("Ad deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete ad", "error");
    }
  };

  const platformOptions = [
    { value: "Facebook", icon: "📘" },
    { value: "TikTok", icon: "🎵" },
    { value: "Instagram", icon: "📸" },
    { value: "YouTube", icon: "▶️" },
  ];

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-96 h-96 top-1/4 left-1/4 opacity-10"></div>
        <div className="bg-orb bg-orb-blue w-96 h-96 bottom-1/4 right-1/4 opacity-10" style={{animationDelay: '7s'}}></div>
      </div>

      {/* TopNav */}
      <div className="relative z-10 py-8">
        <TopNav />
      </div>

      {/* Page Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-8">
        {/* Page Header */}
        <div className="mb-8 text-center animate-fade-up">
          <h1 className="text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200">
            AI Ads Generator
          </h1>
          <p className="text-white/80 text-lg">
            Create high-converting ad campaigns with AI
          </p>
        </div>

        {/* Main Layout - 2 columns */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Form + History */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ad Setup Form */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-6 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-fade-up">
              <h2 className="text-2xl font-bold text-white mb-6">
                Create New Ad
              </h2>

              {/* Ad Title */}
              <div className="mb-4">
                <label className="block text-white/90 text-sm font-semibold mb-2">
                  Ad Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., MyFitness Pro Launch"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Product Description */}
              <div className="mb-4">
                <label className="block text-white/90 text-sm font-semibold mb-2">
                  Product Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product and its main benefits..."
                  rows="4"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Target Audience */}
              <div className="mb-4">
                <label className="block text-white/90 text-sm font-semibold mb-2">
                  Target Audience *
                </label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  placeholder="e.g., busy professionals, fitness enthusiasts"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Platform Selection */}
              <div className="mb-6">
                <label className="block text-white/90 text-sm font-semibold mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {platformOptions.map(({ value, icon }) => (
                    <button
                      key={value}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, platform: value }))
                      }
                      className={`px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        formData.platform === value
                          ? "bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white shadow-lg backdrop-blur-md border border-white/20"
                          : "bg-white/10 text-white/70 hover:bg-white/15 border border-white/10"
                      }`}
                    >
                      {icon} {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !currentUser}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-md border border-white/10"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : !currentUser ? (
                  <span>🔒 Sign in to Generate</span>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Generate Ad</span>
                  </>
                )}
              </button>
            </div>

            {/* History Section */}
            {currentUser && ads.length > 0 && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-6 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-fade-up delay-100">
                <h3 className="text-lg font-bold text-white mb-4">
                  Previous Ads
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {ads.map((ad) => (
                    <div
                      key={ad.id}
                      className={`p-4 rounded-xl transition-all duration-300 ${
                        selectedAd === ad.id
                          ? "bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-white/30 shadow-lg shadow-purple-500/20"
                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm truncate">
                            {ad.title}
                          </p>
                          <TimeAgo timestamp={ad.createdAt} className="text-white/60 text-xs mt-1 block" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(ad)}
                          className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() =>
                            handleCopy(
                              `${ad.script}\n\n${ad.caption}\n\n${ad.hooks.join(
                                "\n"
                              )}`
                            )
                          }
                          className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg text-xs font-medium transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Output */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-6 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] min-h-[600px] animate-fade-up delay-200">
              {!output ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="w-24 h-24 mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <span className="text-6xl">✨</span>
                  </div>
                  <p className="text-white text-xl font-semibold mb-2">
                    Ready to create amazing ads?
                  </p>
                  <p className="text-white/60">
                    Fill in the form and click Generate Ad to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Generated Script */}
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">
                        🎬 Generated Script
                      </h3>
                      <button
                        onClick={() => handleCopy(output.script)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <pre className="text-white/90 whitespace-pre-wrap leading-relaxed font-sans text-sm">
                        {output.script}
                      </pre>
                    </div>
                  </div>

                  {/* Generated Caption */}
                  <div className="animate-fade-in delay-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">
                        📝 Generated Caption
                      </h3>
                      <button
                        onClick={() => handleCopy(output.caption)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                        {output.caption}
                      </p>
                    </div>
                  </div>

                  {/* Generated Hooks */}
                  <div className="animate-fade-in delay-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">
                        🎯 Generated Hooks
                      </h3>
                      <button
                        onClick={() => handleCopy(output.hooks.join("\n"))}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all"
                      >
                        📋 Copy All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {output.hooks.map((hook, index) => (
                        <div
                          key={index}
                          className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10 group hover:bg-black/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-white/90 flex-1">{hook}</p>
                            <button
                              onClick={() => handleCopy(hook)}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-16"></div>
      </div>

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

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }

        .delay-2000 {
          animation-delay: 2000ms;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </main>
  );
}
