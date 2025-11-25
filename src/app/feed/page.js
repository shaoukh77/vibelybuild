"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import TopNav from "@/components/TopNav";
import BetaRibbon from "@/components/BetaRibbon";
import PreBetaNotice from "@/components/PreBetaNotice";
import Footer from "@/components/Footer";
import BlissBackground from "@/components/BlissBackground";
import PostComposer from "@/components/Feed/PostComposer";
import PostCard from "@/components/Feed/PostCard";
import { listenFeed, listenForYouFeed } from "@/lib/firebaseFeed";
import { listenFollowing } from "@/lib/follow";
import { onAuthChange } from "@/lib/firebase";

export default function FeedPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showComposerModal, setShowComposerModal] = useState(false);

  // Following state
  const [followingList, setFollowingList] = useState([]);

  // Tab state
  const [activeTab, setActiveTab] = useState("for-you"); // 'for-you' or 'global'

  const observerRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Listen to following list
  useEffect(() => {
    if (!currentUser) {
      setFollowingList([]);
      return;
    }

    const unsubscribe = listenFollowing((following) => {
      setFollowingList(following);
      console.log("✅ TEST: Following list updated", { count: following.length, following });
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Listen to feed based on active tab
  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setLastDoc(null);
    setHasMore(false);

    let unsubscribe;

    if (activeTab === "for-you" && currentUser) {
      // For You feed - posts from followed users + own posts
      unsubscribe = listenForYouFeed(
        followingList,
        currentUser.uid,
        (data) => {
          setPosts(data.posts);
          setLastDoc(data.lastDoc);
          setHasMore(data.hasMore);
          setLoading(false);
          console.log("✅ TEST: For You feed loaded", { count: data.posts.length, hasMore: data.hasMore });
        }
      );
    } else {
      // Global feed - all posts
      unsubscribe = listenFeed((data) => {
        setPosts(data.posts);
        setLastDoc(data.lastDoc);
        setHasMore(data.hasMore);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeTab, currentUser, followingList]);

  // Load more posts
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || !lastDoc) return;

    setIsLoadingMore(true);

    let unsubscribe;

    if (activeTab === "for-you" && currentUser) {
      unsubscribe = listenForYouFeed(
        followingList,
        currentUser.uid,
        (data) => {
          setPosts((prev) => [...prev, ...data.posts]);
          setLastDoc(data.lastDoc);
          setHasMore(data.hasMore);
          setIsLoadingMore(false);
          unsubscribe();
        },
        lastDoc
      );
    } else {
      unsubscribe = listenFeed(
        (data) => {
          setPosts((prev) => [...prev, ...data.posts]);
          setLastDoc(data.lastDoc);
          setHasMore(data.hasMore);
          setIsLoadingMore(false);
          unsubscribe();
        },
        lastDoc
      );
    }
  }, [hasMore, isLoadingMore, lastDoc, activeTab, currentUser, followingList]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (loading || !hasMore) return;

    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    }, options);

    const currentTrigger = loadMoreTriggerRef.current;
    if (currentTrigger) {
      observerRef.current.observe(currentTrigger);
    }

    return () => {
      if (observerRef.current && currentTrigger) {
        observerRef.current.unobserve(currentTrigger);
      }
    };
  }, [loading, hasMore, isLoadingMore, loadMore]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    console.log("✅ TEST: Tab changed", { tab });
  };

  return (
    <BlissBackground>
      {/* Beta Ribbon */}
      <BetaRibbon />

      {/* Pre-Beta Notice Banner */}
      <PreBetaNotice />

      {/* Main Content */}

      {/* TopNav - Full Width */}
      <div className="relative z-10 py-8">
        <TopNav />
      </div>

      {/* Feed Content - Constrained Width */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-8">

        {/* Page Header with Glass Effect */}
        <div className="mb-8 text-center animate-fade-up">
          <h1 className="text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200">
            Community Feed
          </h1>
          <p className="text-white/80 text-lg">Share builds, wins, and experiments</p>
        </div>

        {/* Tabs with Enhanced Glass Effect */}
        <div className="mb-8 bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-2 flex gap-2 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-fade-up delay-100">
          <button
            onClick={() => handleTabChange("for-you")}
            className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === "for-you"
                ? "bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white shadow-lg shadow-purple-500/50 scale-105 backdrop-blur-md border border-white/10"
                : "text-white/70 hover:text-white hover:bg-white/10 hover:scale-105"
            }`}
            aria-label="For You feed"
          >
            ✨ For You
          </button>
          <button
            onClick={() => handleTabChange("global")}
            className={`flex-1 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === "global"
                ? "bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white shadow-lg shadow-purple-500/50 scale-105 backdrop-blur-md border border-white/10"
                : "text-white/70 hover:text-white hover:bg-white/10 hover:scale-105"
            }`}
            aria-label="Global feed"
          >
            🌍 Global
          </button>
        </div>

        {/* Desktop Post Composer */}
        <div className="mb-8 hidden md:block animate-fade-up delay-200">
          <PostComposer currentUser={currentUser} />
        </div>

        {/* Feed Content */}
        <div className="space-y-6">
          {loading ? (
            // Skeleton Loading with Glass Effect
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-8 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-pulse"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/20 rounded w-1/3"></div>
                      <div className="h-3 bg-white/20 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                    <div className="h-4 bg-white/20 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            // Empty State with Glass Effect
            <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-16 text-center shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] animate-fade-up">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-6xl">📭</span>
              </div>
              {activeTab === "for-you" && currentUser ? (
                <>
                  <p className="text-white text-xl font-semibold mb-2">Your personalized feed is empty</p>
                  <p className="text-white/60 text-lg">
                    Follow people to see their posts here, or switch to Global to see all posts
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white text-xl font-semibold mb-2">No posts yet</p>
                  <p className="text-white/60 text-lg">Be the first to share something amazing!</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Posts with Stagger Animation */}
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PostCard post={post} currentUser={currentUser} />
                </div>
              ))}

              {/* Infinite Scroll Trigger */}
              {hasMore && (
                <div ref={loadMoreTriggerRef} className="py-8 text-center">
                  {isLoadingMore ? (
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 backdrop-blur-md rounded-full shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-white/90 font-medium">Loading more...</span>
                    </div>
                  ) : (
                    <button
                      onClick={loadMore}
                      className="px-8 py-4 bg-white/10 border border-white/20 backdrop-blur-md rounded-full text-white/90 font-semibold hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]"
                    >
                      Load More Posts
                    </button>
                  )}
                </div>
              )}

              {/* End of Feed */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8">
                  <div className="inline-block px-6 py-3 bg-white/10 border border-white/20 backdrop-blur-md rounded-full shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]">
                    <p className="text-white/70 text-sm font-medium">🎉 You've seen it all!</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Spacing for Floating Button */}
        <div className="h-24"></div>
      </div>

      {/* Floating "+" Button (Mobile) */}
      <button
        onClick={() => setShowComposerModal(true)}
        className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white text-3xl font-bold rounded-full shadow-2xl shadow-purple-500/50 hover:from-purple-500 hover:to-blue-500 hover:scale-110 active:scale-95 transition-all duration-300 z-50 flex items-center justify-center border-2 border-white/30 backdrop-blur-md"
        aria-label="Create new post"
      >
        +
      </button>

      {/* Post Composer Modal (Mobile) */}
      {showComposerModal && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowComposerModal(false);
          }}
        >
          <div className="w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black/95 via-purple-900/95 to-black/95 backdrop-blur-2xl rounded-t-3xl p-6 shadow-2xl border-t-2 border-white/20 animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create Post</h2>
              <button
                onClick={() => setShowComposerModal(false)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Post Composer */}
            <PostComposer
              currentUser={currentUser}
              onPostCreated={() => setShowComposerModal(false)}
            />
          </div>
        </div>
      )}

      {/* Custom Animations */}
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
      `}</style>

      {/* Footer */}
      <Footer />
    </BlissBackground>
  );
}
