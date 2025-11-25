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
import { authFetch } from "@/lib/authFetch";

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

  // Output state - now includes AI generated images
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
    setOutput(null); // Clear previous output

    try {
      console.log('[Ads Page] Calling AI image generation API...');

      // Call the real AI Ads Generator API
      const response = await authFetch('/api/ads/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          audience: formData.targetAudience,
          platform: formData.platform,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate ads');
      }

      console.log('[Ads Page] AI images generated successfully:', result);

      // Set output with generated images
      setOutput({
        images: result.images || [],
        sessionId: result.sessionId,
        generatedAt: result.generatedAt,
      });

      // Save to Firestore
      const adsRef = collection(db, "users", currentUser.uid, "ads");
      await addDoc(adsRef, {
        title: formData.title,
        description: formData.description,
        targetAudience: formData.targetAudience,
        platform: formData.platform,
        images: result.images || [],
        sessionId: result.sessionId,
        createdAt: serverTimestamp(),
      });

      showToast("AI ad images generated successfully!");

    } catch (error) {
      console.error("[Ads Page] Generation error:", error);
      showToast(`Ad generation failed: ${error.message}`, "error");
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
      images: ad.images || [],
      sessionId: ad.sessionId,
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

  const handleDownloadImage = (imageUrl, filename) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename || 'ad-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Image download started!");
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
            Create high-converting ad graphics with AI
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
                  <h3 className="text-2xl font-bold text-white mb-6">
                    🎨 Generated Ad Graphics
                  </h3>

                  {/* Display Generated Images */}
                  {output.images && output.images.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {output.images.map((image, index) => (
                        <div
                          key={index}
                          className="animate-fade-in bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all group"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-white font-semibold text-sm">
                              Ad Variation {index + 1}
                            </p>
                            <button
                              onClick={() => handleDownloadImage(image.url, image.filename)}
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-medium transition-all opacity-0 group-hover:opacity-100"
                            >
                              ⬇️ Download
                            </button>
                          </div>

                          {/* Image Display */}
                          <div className="relative aspect-square overflow-hidden rounded-xl bg-black/30">
                            <img
                              src={image.url}
                              alt={`Generated ad ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = '/placeholder-ad.png';
                                console.error('Failed to load image:', image.url);
                              }}
                            />
                          </div>

                          {/* Image Actions */}
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleCopy(window.location.origin + image.url)}
                              className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all"
                            >
                              🔗 Copy Link
                            </button>
                            <a
                              href={image.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all text-center"
                            >
                              👁️ Open
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-white/60">No images generated</p>
                    </div>
                  )}

                  {/* Session Info */}
                  {output.sessionId && (
                    <div className="mt-6 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                      <p className="text-white/60 text-xs">
                        Session ID: <span className="text-white/80 font-mono">{output.sessionId}</span>
                      </p>
                      {output.generatedAt && (
                        <p className="text-white/60 text-xs mt-1">
                          Generated: <span className="text-white/80">{new Date(output.generatedAt).toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  )}
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
