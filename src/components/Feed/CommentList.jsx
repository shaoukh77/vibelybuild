"use client";
import { useEffect, useState } from "react";
import { listenComments, deleteComment } from "@/lib/firebaseFeed";
import { formatDistanceToNow } from "date-fns";

export default function CommentList({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());

  useEffect(() => {
    const unsubscribe = listenComments(postId, (data) => {
      setComments(data.comments);
      setLastDoc(data.lastDoc);
      setHasMore(data.hasMore);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore || !lastDoc) return;

    setIsLoadingMore(true);
    const unsubscribe = listenComments(
      postId,
      (data) => {
        setComments((prev) => [...prev, ...data.comments]);
        setLastDoc(data.lastDoc);
        setHasMore(data.hasMore);
        setIsLoadingMore(false);
        unsubscribe(); // Stop listening after loading more
      },
      lastDoc
    );
  };

  const handleDelete = async (commentId) => {
    if (!currentUser) return;

    if (!confirm("Delete this comment?")) return;

    setDeletingIds((prev) => new Set(prev).add(commentId));
    try {
      await deleteComment(postId, commentId);
      console.log("Comment deleted successfully!");
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(err.message || "Failed to delete comment");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  if (comments.length === 0) {
    return (
      <p className="text-white/50 text-sm text-center py-4">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isOwner = currentUser && comment.userId === currentUser.uid;
        const isDeleting = deletingIds.has(comment.id);

        return (
          <div
            key={comment.id}
            className={`flex gap-3 ${isDeleting ? "opacity-50" : ""}`}
          >
            {/* Avatar */}
            {comment.userPhoto ? (
              <img
                src={comment.userPhoto}
                alt={comment.userName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-white/70 text-xs">
                  {comment.userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Comment Content */}
            <div className="flex-1 bg-white/5 rounded-xl p-3">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-white/90 font-semibold text-sm">
                    {comment.userName}
                  </span>
                  <span className="text-white/50 text-xs">
                    {comment.createdAt
                      ? formatDistanceToNow(comment.createdAt.toDate(), {
                          addSuffix: true,
                        })
                      : "just now"}
                  </span>
                </div>

                {/* Delete Button (owner only) */}
                {isOwner && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isDeleting}
                    className="text-white/50 hover:text-red-400 text-xs transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "..." : "Delete"}
                  </button>
                )}
              </div>
              <p className="text-white/80 text-sm">{comment.content}</p>
            </div>
          </div>
        );
      })}

      {/* Load More Button */}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="w-full text-center py-2 text-white/70 hover:text-white text-sm transition-colors disabled:opacity-50"
        >
          {isLoadingMore ? "Loading..." : "Load more comments"}
        </button>
      )}
    </div>
  );
}
