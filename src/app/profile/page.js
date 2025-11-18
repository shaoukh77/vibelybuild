"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import { onAuthChange, signOutUser } from "@/lib/firebase";
import { getUserBuildCount } from "@/lib/db";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buildCount, setBuildCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Get build count
        getUserBuildCount(currentUser.uid).then(count => {
          setBuildCount(count);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen relative overflow-x-hidden">
        {/* Subtle Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="bg-orb bg-orb-purple w-96 h-96 top-1/4 left-1/4 opacity-10"></div>
          <div className="bg-orb bg-orb-blue w-96 h-96 bottom-1/4 right-1/4 opacity-10" style={{animationDelay: '7s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <TopNav />
          <div className="glass-section mt-6 text-white text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p>Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen relative overflow-x-hidden">
        {/* Subtle Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="bg-orb bg-orb-purple w-96 h-96 top-1/4 left-1/4 opacity-10"></div>
          <div className="bg-orb bg-orb-blue w-96 h-96 bottom-1/4 right-1/4 opacity-10" style={{animationDelay: '7s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <TopNav />
          <div className="glass-section mt-6 text-white text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-4xl">🔒</span>
            </div>
            <p className="text-xl mb-4">Please sign in</p>
            <p className="text-white/60">You need to be signed in to view your profile</p>
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <TopNav />

        <div className="mt-6 max-w-2xl mx-auto">
          <div className="glass-section text-white animate-fade-up">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>

          {/* User Info */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center text-2xl">
                {user.displayName?.[0] || user.email?.[0] || "U"}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {user.displayName || "User"}
              </h2>
              <p className="text-white/60">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 pb-6 border-b border-white/10">
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-1">Total Builds</p>
                <p className="text-2xl font-bold">{buildCount}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-1">Member Since</p>
                <p className="text-sm font-semibold">
                  {user.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : "Recently"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/build")}
                className="w-full pill bg-white/10 hover:bg-white/20 text-white text-left flex items-center justify-between"
              >
                <span>Go to Build</span>
                <span>→</span>
              </button>
              <button
                onClick={() => router.push("/store")}
                className="w-full pill bg-white/10 hover:bg-white/20 text-white text-left flex items-center justify-between"
              >
                <span>Go to Store</span>
                <span>→</span>
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full pill bg-white/10 hover:bg-white/20 text-white text-left flex items-center justify-between"
              >
                <span>Go to Home</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full pill bg-red-500/20 hover:bg-red-500/30 text-red-200 font-semibold"
          >
            Sign Out
          </button>
          </div>
        </div>
      </div>
    </main>
  );
}
