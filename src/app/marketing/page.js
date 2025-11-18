"use client";
import { useState, useEffect } from "react";
import TopNav from "@/components/TopNav";
import BlissBackground from "@/components/BlissBackground";
import { onAuthChange } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Placeholder AI generation functions
function generateHeadline(input) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        `${input} - Transform Your Business Today`,
        `Discover the Power of ${input}`,
        `${input}: The Game-Changer You Need`,
      ]);
    }, 1500);
  });
}

function fixDescription(input) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Enhanced: ${input}\n\nThis improved version is more engaging, uses active voice, and includes a clear value proposition that resonates with your target audience.`);
    }, 1500);
  });
}

function generateCTA(input) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        `Get Started with ${input} Now`,
        `Unlock ${input} Today`,
        `Try ${input} Free`,
        `Join Thousands Using ${input}`,
      ]);
    }, 1500);
  });
}

function researchKeywords(input) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        `${input} solutions`,
        `best ${input} tools`,
        `${input} for beginners`,
        `${input} software`,
        `affordable ${input}`,
        `${input} platform`,
        `${input} app`,
        `professional ${input}`,
      ]);
    }, 1500);
  });
}

export default function MarketingPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);

  // Tool modal state
  const [toolInput, setToolInput] = useState("");
  const [toolOutput, setToolOutput] = useState(null);
  const [toolLoading, setToolLoading] = useState(false);

  // Campaign form
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    platform: "Facebook",
    budget: "",
    goal: "",
  });

  // Stats
  const [stats, setStats] = useState({
    totalViews: 12543,
    totalAdCopies: 0,
    conversions: 234,
    ctr: 3.2,
  });

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to campaigns
  useEffect(() => {
    if (!currentUser) {
      setCampaigns([]);
      return;
    }

    const campaignsRef = collection(db, "users", currentUser.uid, "campaigns");
    // Simplified query: no orderBy to avoid composite index - will sort client-side
    const q = query(campaignsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userCampaigns = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort client-side by createdAt descending
      userCampaigns.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setCampaigns(userCampaigns);
    }, (error) => {
      console.warn('Error loading campaigns:', error);
      setCampaigns([]);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to ads count
  useEffect(() => {
    if (!currentUser) return;

    const adsRef = collection(db, "users", currentUser.uid, "ads");
    const unsubscribe = onSnapshot(adsRef, (snapshot) => {
      setStats((prev) => ({
        ...prev,
        totalAdCopies: snapshot.docs.length,
      }));
    }, (error) => {
      console.warn('Error loading ads count:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCampaignSubmit = async () => {
    if (!currentUser) {
      showToast("Please sign in", "error");
      return;
    }

    if (!campaignForm.name || !campaignForm.goal) {
      showToast("Please fill in required fields", "error");
      return;
    }

    setLoading(true);
    try {
      if (editingCampaign) {
        const campaignRef = doc(
          db,
          "users",
          currentUser.uid,
          "campaigns",
          editingCampaign.id
        );
        await updateDoc(campaignRef, {
          ...campaignForm,
          updatedAt: serverTimestamp(),
        });
        showToast("Campaign updated successfully!");
      } else {
        const campaignsRef = collection(
          db,
          "users",
          currentUser.uid,
          "campaigns"
        );
        await addDoc(campaignsRef, {
          ...campaignForm,
          status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast("Campaign created successfully!");
      }

      setShowCampaignModal(false);
      setCampaignForm({
        name: "",
        platform: "Facebook",
        budget: "",
        goal: "",
      });
      setEditingCampaign(null);
    } catch (error) {
      console.error("Campaign error:", error);
      showToast("Failed to save campaign", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      platform: campaign.platform,
      budget: campaign.budget,
      goal: campaign.goal,
    });
    setShowCampaignModal(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!currentUser) return;

    try {
      const campaignRef = doc(
        db,
        "users",
        currentUser.uid,
        "campaigns",
        campaignId
      );
      await deleteDoc(campaignRef);
      showToast("Campaign deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete campaign", "error");
    }
  };

  const handleToggleStatus = async (campaign) => {
    if (!currentUser) return;

    try {
      const campaignRef = doc(
        db,
        "users",
        currentUser.uid,
        "campaigns",
        campaign.id
      );
      await updateDoc(campaignRef, {
        status: campaign.status === "active" ? "paused" : "active",
        updatedAt: serverTimestamp(),
      });
      showToast(
        `Campaign ${campaign.status === "active" ? "paused" : "activated"}!`
      );
    } catch (error) {
      console.error("Status toggle error:", error);
      showToast("Failed to update status", "error");
    }
  };

  const handleToolGenerate = async () => {
    if (!toolInput.trim()) {
      showToast("Please enter some text", "error");
      return;
    }

    setToolLoading(true);
    try {
      let result;
      switch (activeTool) {
        case "headline":
          result = await generateHeadline(toolInput);
          break;
        case "description":
          result = await fixDescription(toolInput);
          break;
        case "cta":
          result = await generateCTA(toolInput);
          break;
        case "keywords":
          result = await researchKeywords(toolInput);
          break;
        default:
          result = "Generated content";
      }
      setToolOutput(result);
      showToast("Generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      showToast("Failed to generate", "error");
    } finally {
      setToolLoading(false);
    }
  };

  const handleCopy = (text) => {
    const textToCopy = Array.isArray(text) ? text.join("\n") : text;
    navigator.clipboard.writeText(textToCopy);
    showToast("Copied to clipboard!");
  };

  const openToolModal = (tool) => {
    setActiveTool(tool);
    setToolInput("");
    setToolOutput(null);
    setShowToolModal(true);
  };

  const closeToolModal = () => {
    setShowToolModal(false);
    setActiveTool(null);
    setToolInput("");
    setToolOutput(null);
  };

  const closeCampaignModal = () => {
    setShowCampaignModal(false);
    setEditingCampaign(null);
    setCampaignForm({
      name: "",
      platform: "Facebook",
      budget: "",
      goal: "",
    });
  };

  const tools = [
    { id: "headline", name: "Headline Generator", icon: "✨", color: "purple" },
    { id: "description", name: "Description Fixer", icon: "📝", color: "blue" },
    { id: "cta", name: "CTA Generator", icon: "🎯", color: "pink" },
    { id: "keywords", name: "Keyword Research", icon: "🔍", color: "green" },
  ];

  const getToolTitle = () => {
    const tool = tools.find((t) => t.id === activeTool);
    return tool ? tool.name : "";
  };

  return (
    <BlissBackground>
      {/* TopNav */}
      <div className="relative z-10 py-8">
        <TopNav />
      </div>

      {/* Page Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-8">
        {/* Page Header */}
        <div className="mb-8 text-center animate-fade-up">
          <h1 className="text-5xl font-bold text-white mb-3">
            Marketing Control Panel
          </h1>
          <p className="text-white/80 text-lg">
            Manage and optimize your campaigns
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-up delay-100">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <p className="text-white/70 text-sm mb-2">Total Views</p>
            <p className="text-white text-3xl font-bold">
              {stats.totalViews.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <p className="text-white/70 text-sm mb-2">Ad Copies</p>
            <p className="text-white text-3xl font-bold">{stats.totalAdCopies}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <p className="text-white/70 text-sm mb-2">Conversions</p>
            <p className="text-white text-3xl font-bold">{stats.conversions}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <p className="text-white/70 text-sm mb-2">CTR</p>
            <p className="text-white text-3xl font-bold">{stats.ctr}%</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Campaign Manager */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 animate-fade-up delay-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Campaign Manager
                </h2>
                <button
                  onClick={() => setShowCampaignModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 backdrop-blur-md border border-white/10 text-white font-semibold rounded-full hover:scale-105 transition-all shadow-lg"
                >
                  + New Campaign
                </button>
              </div>

              {/* Campaign List */}
              <div className="space-y-3">
                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/60 mb-4">No campaigns yet</p>
                    <button
                      onClick={() => setShowCampaignModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 backdrop-blur-md border border-white/10 text-white rounded-full font-medium transition-all"
                    >
                      Create Your First Campaign
                    </button>
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-bold text-lg">
                              {campaign.name}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                campaign.status === "active"
                                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                  : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                              }`}
                            >
                              {campaign.status === "active"
                                ? "● Active"
                                : "■ Paused"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-white/50">Platform</p>
                              <p className="text-white/90">{campaign.platform}</p>
                            </div>
                            <div>
                              <p className="text-white/50">Budget</p>
                              <p className="text-white/90">
                                {campaign.budget || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-white/50">Goal</p>
                              <p className="text-white/90 truncate">
                                {campaign.goal}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleToggleStatus(campaign)}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all"
                          >
                            {campaign.status === "active" ? "⏸" : "▶"}
                          </button>
                          <button
                            onClick={() => handleEditCampaign(campaign)}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg text-xs font-medium transition-all"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI Helper Tools */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 animate-fade-up delay-300">
              <h2 className="text-2xl font-bold text-white mb-6">
                AI Helper Tools
              </h2>

              <div className="space-y-3">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => openToolModal(tool.id)}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all hover:scale-105 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tool.icon}</span>
                      <div className="flex-1">
                        <p className="text-white font-semibold group-hover:text-purple-200 transition-colors">
                          {tool.name}
                        </p>
                      </div>
                      <span className="text-white/50 group-hover:text-white transition-colors">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-16"></div>
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCampaignModal();
          }}
        >
          <div className="bg-gradient-to-br from-black/95 via-purple-900/95 to-black/95 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-white/20 animate-scale-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingCampaign ? "Edit Campaign" : "New Campaign"}
              </h3>
              <button
                onClick={closeCampaignModal}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/90 text-sm font-semibold mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, name: e.target.value })
                  }
                  placeholder="e.g., Summer Sale 2024"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-semibold mb-2">
                  Platform
                </label>
                <select
                  value={campaignForm.platform}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      platform: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Google Ads">Google Ads</option>
                </select>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-semibold mb-2">
                  Budget
                </label>
                <input
                  type="text"
                  value={campaignForm.budget}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, budget: e.target.value })
                  }
                  placeholder="e.g., $500"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-semibold mb-2">
                  Goal *
                </label>
                <textarea
                  value={campaignForm.goal}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, goal: e.target.value })
                  }
                  placeholder="e.g., Increase brand awareness..."
                  rows="3"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <button
                onClick={handleCampaignSubmit}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 backdrop-blur-md border border-white/10 text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : editingCampaign ? (
                  "Update Campaign"
                ) : (
                  "Create Campaign"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tool Modal */}
      {showToolModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeToolModal();
          }}
        >
          <div className="bg-gradient-to-br from-black/95 via-purple-900/95 to-black/95 backdrop-blur-2xl rounded-3xl p-8 max-w-2xl w-full shadow-2xl border-2 border-white/20 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {getToolTitle()}
              </h3>
              <button
                onClick={closeToolModal}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/90 text-sm font-semibold mb-2">
                  Enter your text
                </label>
                <textarea
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  placeholder={
                    activeTool === "headline"
                      ? "Enter your product or service name..."
                      : activeTool === "description"
                      ? "Paste your description to improve..."
                      : activeTool === "cta"
                      ? "Enter your offer or action..."
                      : "Enter topic for keyword research..."
                  }
                  rows="4"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <button
                onClick={handleToolGenerate}
                disabled={toolLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 backdrop-blur-md border border-white/10 text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {toolLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  "✨ Generate"
                )}
              </button>

              {/* Results */}
              {toolOutput && (
                <div className="mt-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-white">Results</h4>
                    <button
                      onClick={() => handleCopy(toolOutput)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    {Array.isArray(toolOutput) ? (
                      <div className="space-y-3">
                        {toolOutput.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 bg-white/5 rounded-lg group hover:bg-white/10 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-white/90 flex-1">{item}</p>
                              <button
                                onClick={() => handleCopy(item)}
                                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-all"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/90 whitespace-pre-wrap">
                        {toolOutput}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
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

        .animate-scale-up {
          animation: scale-up 0.3s ease-out forwards;
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

        .delay-1000 {
          animation-delay: 1000ms;
        }

        .delay-2000 {
          animation-delay: 2000ms;
        }

        select option {
          background: #1a1a2e;
          color: white;
        }
      `}</style>
    </BlissBackground>
  );
}
