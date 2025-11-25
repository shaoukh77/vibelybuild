"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signOutUser, onAuthChange } from "@/lib/firebase";

export default function AuthButton() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setShowDropdown(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleNavigate = (path) => {
    setShowDropdown(false);
    router.push(path);
  };

  if (loading) {
    return (
      <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white/50 text-sm">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30"
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="group relative p-1 rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-110"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="w-10 h-10 rounded-full ring-2 ring-white/30 group-hover:ring-white/50 transition-all"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/30 group-hover:ring-white/50 transition-all">
            {user.displayName?.[0] || user.email?.[0] || "U"}
          </div>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-3 w-56 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] overflow-hidden z-20 shadow-2xl shadow-black/20">
            <div className="py-2">
              <button
                onClick={() => handleNavigate("/build")}
                className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors text-sm font-medium"
              >
                My Builds
              </button>
              <button
                onClick={() => handleNavigate("/profile/apps")}
                className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors text-sm font-medium"
              >
                My Published Apps
              </button>
              <button
                onClick={() => handleNavigate("/profile")}
                className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors text-sm font-medium"
              >
                Profile
              </button>
              <div className="border-t border-white/10 my-2" />
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2.5 text-left text-red-300 hover:text-red-200 hover:bg-white/10 transition-colors text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
