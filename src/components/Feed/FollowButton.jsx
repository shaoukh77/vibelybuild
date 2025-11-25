"use client";
import { useEffect, useState } from "react";
import { followUser, unfollowUser, listenIsFollowing } from "@/lib/follow";

export default function FollowButton({ targetUserId, currentUser, size = "sm" }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isOwnProfile = currentUser && targetUserId === currentUser.uid;

  // Listen to following status in real-time
  useEffect(() => {
    if (!currentUser || isOwnProfile) return;

    const unsubscribe = listenIsFollowing(targetUserId, (following) => {
      setIsFollowing(following);
    });

    return () => unsubscribe();
  }, [targetUserId, currentUser, isOwnProfile]);

  const handleToggleFollow = async (e) => {
    e.stopPropagation(); // Prevent event bubbling

    if (!currentUser || isLoading || isOwnProfile) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
      } else {
        await followUser(targetUserId);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      alert(err.message || "Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if not signed in or if it's own profile
  if (!currentUser || isOwnProfile) return null;

  const sizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={`${sizeClasses[size]} rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing
          ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
          : "bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-md border border-white/10 hover:opacity-90 text-white"
      }`}
      aria-label={isFollowing ? "Unfollow user" : "Follow user"}
    >
      {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
