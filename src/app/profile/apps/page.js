"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import TimeAgo from "@/components/TimeAgo";
import { onAuthChange } from "@/lib/firebase";
import { subscribeToUserApps, unpublishApp } from "@/lib/firestore";
import { authFetch } from "@/lib/authFetch";

export default function MyPublishedApps() {
  const [user, setUser] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [unpublishingId, setUnpublishingId] = useState(null);
  const router = useRouter();

  const userId = user?.uid || null;

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to user's apps from users/{uid}/apps collection (real-time)
  useEffect(() => {
    if (!userId) {
      setApps([]);
      return;
    }

    const unsubscribe = subscribeToUserApps(userId, (userApps) => {
      setApps(userApps);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleUnpublish = async (appId) => {
    if (!confirm('Are you sure you want to unpublish this app? It will be removed from the store.')) return;

    setUnpublishingId(appId);

    try {
      // Use the unpublishApp helper which updates both collections
      await unpublishApp(appId, userId);

      // The real-time listener will update the UI automatically
      alert('✅ App unpublished successfully! It has been removed from the store.');
    } catch (error) {
      console.error('Unpublish error:', error);
      alert(error.message || 'Failed to unpublish app');
    } finally {
      setUnpublishingId(null);
    }
  };

  const handleDelete = async (appId) => {
    if (!confirm('Are you sure you want to delete this app? This cannot be undone.')) return;

    setDeletingId(appId);

    try {
      // Use authFetch which automatically adds Firebase ID token
      await authFetch(`/api/publish/${appId}`, {
        method: 'DELETE',
      });

      // The real-time listener will update the UI automatically
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete app');
    } finally {
      setDeletingId(null);
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
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-white/70 text-lg">Please sign in</p>
            <p className="text-sm text-white/50 mt-2">You need to be signed in to view your published apps</p>
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

        <div className="mt-6">
          {/* Back button */}
          <button
            onClick={() => router.push("/profile")}
            className="mb-4 pill bg-white/10 text-white hover:bg-white/20 text-sm"
          >
            ← Back to Profile
          </button>

          <div className="glass-section mb-6 animate-fade-up">
            <h1 className="text-2xl font-bold text-white">My Published Apps</h1>
            <p className="text-white/70 mt-1">Apps you've shared with the community</p>
          </div>

          {apps.length === 0 ? (
            <div className="glass-section text-white text-center py-12 animate-fade-up">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-white/70 text-lg">No published apps yet</p>
              <p className="text-sm text-white/50 mt-2">Build and publish your first app!</p>
              <button
                onClick={() => router.push("/build")}
                className="mt-4 pill bg-white/20 text-white hover:bg-white/30"
              >
                Go to Build
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {apps.map((app, index) => (
                <div
                  key={app.id}
                  className="glass-section hover:bg-white/5 transition-all animate-fade-up"
                  style={{animationDelay: `${index * 50}ms`}}
                >
                <div className="flex items-start justify-between gap-4">
                  {/* App Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-white font-semibold mb-1 cursor-pointer hover:text-blue-300 transition-colors"
                      onClick={() => router.push(`/store/app/${app.id}`)}
                    >
                      {app.title}
                    </h3>
                    {app.description && (
                      <p className="text-white/60 text-sm mb-2 line-clamp-2">
                        {app.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <TimeAgo timestamp={app.createdAt} prefix="Published " />
                      <span className="text-green-300">✓ Published</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {app.status === 'published' && (
                      <button
                        onClick={() => router.push(`/store/app/${app.id}`)}
                        className="pill bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 text-xs"
                      >
                        Open
                      </button>
                    )}
                    <button
                      onClick={() => handleUnpublish(app.id)}
                      disabled={unpublishingId === app.id || deletingId === app.id || app.status === 'unpublished'}
                      className="pill bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30 disabled:opacity-50 text-xs"
                    >
                      {unpublishingId === app.id ? 'Unpublishing...' : app.status === 'unpublished' ? 'Unpublished' : 'Unpublish'}
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      disabled={deletingId === app.id || unpublishingId === app.id}
                      className="pill bg-red-500/20 text-red-200 hover:bg-red-500/30 disabled:opacity-50 text-xs"
                    >
                      {deletingId === app.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
