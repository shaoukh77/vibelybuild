"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toggleLike, listenLikes, listenCommentCount, updatePost, deletePost } from "@/lib/firebaseFeed";
import { getOrCreateConversation } from "@/lib/firestore";
import { formatDistanceToNow } from "date-fns";
import CommentList from "./CommentList";
import CommentComposer from "./CommentComposer";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import FollowButton from "./FollowButton";

const MAX_CONTENT_LENGTH = 1000;

export default function PostCard({ post, currentUser }) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [likeData, setLikeData] = useState({ count: 0, isLiked: false });
  const [commentCount, setCommentCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Menu state
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef(null);

  const isOwner = currentUser && post.userId === currentUser.uid;
  const isDeleted = post.status === "deleted";

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  // Listen to likes in real-time
  useEffect(() => {
    const unsubscribe = listenLikes(post.id, (data) => {
      setLikeData(data);
    });

    return () => unsubscribe();
  }, [post.id]);

  // Listen to comment count in real-time
  useEffect(() => {
    const unsubscribe = listenCommentCount(post.id, (count) => {
      setCommentCount(count);
    });

    return () => unsubscribe();
  }, [post.id]);

  const handleLike = async () => {
    if (!currentUser || isLiking || isDeleted) return;

    setIsLiking(true);
    // Optimistic UI update
    const previousState = { ...likeData };
    setLikeData({
      count: likeData.isLiked ? likeData.count - 1 : likeData.count + 1,
      isLiked: !likeData.isLiked,
    });

    try {
      await toggleLike(post.id, currentUser);
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert on error
      setLikeData(previousState);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(post.content);
    setEditError("");
    setShowMenu(false);
    console.log("📝 TEST: Edit mode activated", { postId: post.id });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
    setEditError("");
    console.log("❌ TEST: Edit cancelled", { postId: post.id });
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setEditError("Post content is required");
      return;
    }

    if (editContent.length > MAX_CONTENT_LENGTH) {
      setEditError(`Post must be less than ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    setIsSaving(true);
    setEditError("");

    try {
      await updatePost(post.id, editContent);
      setIsEditing(false);
      // Note: The post will update in real-time via the feed listener
    } catch (err) {
      console.error("Error updating post:", err);
      setEditError(err.message || "Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
    console.log("🗑️  TEST: Delete confirmation modal opened", { postId: post.id });
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);

    try {
      await deletePost(post.id);
      // Note: The post will update in real-time to show "deleted" status
    } catch (err) {
      console.error("Error deleting post:", err);
      alert(err.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const charactersRemaining = MAX_CONTENT_LENGTH - editContent.length;
  const isOverLimit = charactersRemaining < 0;

  const handleStartChat = async () => {
    if (!currentUser) {
      alert("Please sign in to send messages");
      return;
    }

    if (post.userId === currentUser.uid) {
      return; // Can't message yourself
    }

    setIsStartingChat(true);

    try {
      const conversationId = await getOrCreateConversation(
        currentUser,
        post.userId,
        { userName: post.userName, userPhoto: post.userPhoto }
      );

      router.push(`/chat?c=${conversationId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert(error.message || "Failed to start chat");
    } finally {
      setIsStartingChat(false);
    }
  };

  // If deleted, show faded card with message
  if (isDeleted) {
    return (
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 opacity-50">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-white/70 text-lg mb-2">🗑️ Deleted by author</p>
            <p className="text-white/50 text-sm">
              {post.deletedAt
                ? `Deleted ${formatDistanceToNow(post.deletedAt.toDate(), { addSuffix: true })}`
                : "This post has been deleted"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            {/* Avatar */}
            {post.userPhoto ? (
              <img
                src={post.userPhoto}
                alt={post.userName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white/70 text-lg">
                  {post.userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Name & Time */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-white/90 font-semibold">{post.userName}</h3>
                {currentUser && post.userId !== currentUser.uid && (
                  <>
                    <FollowButton
                      targetUserId={post.userId}
                      currentUser={currentUser}
                      size="sm"
                    />
                    <button
                      onClick={handleStartChat}
                      disabled={isStartingChat}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Send message"
                    >
                      <span>💬</span>
                      <span>Message</span>
                    </button>
                  </>
                )}
              </div>
              <p className="text-white/50 text-sm">
                {post.createdAt
                  ? formatDistanceToNow(post.createdAt.toDate(), {
                      addSuffix: true,
                    })
                  : "just now"}
                {post.updatedAt && " • edited"}
              </p>
            </div>
          </div>

          {/* 3-Dot Menu (owner only) */}
          {isOwner && !isEditing && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Post options menu"
                aria-haspopup="true"
                aria-expanded={showMenu}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-blue-900/95 border border-white/20 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden z-10">
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                    aria-label="Edit post"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-4 py-3 text-left text-red-400 hover:bg-white/10 transition-colors flex items-center gap-3"
                    aria-label="Delete post"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-3">
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={`w-full bg-white/5 focus:bg-white/10 border ${
                    isOverLimit ? "border-red-500" : "border-white/10"
                  } rounded-xl px-4 py-3 text-white placeholder-white/50 resize-none transition-colors focus:outline-none focus:ring-2 ${
                    isOverLimit ? "focus:ring-red-500/50" : "focus:ring-purple-500/50"
                  }`}
                  rows={4}
                  disabled={isSaving}
                  aria-label="Edit post content"
                />
                <div className="flex justify-between items-center mt-1 px-1">
                  <span
                    className={`text-xs ${
                      isOverLimit
                        ? "text-red-400 font-semibold"
                        : charactersRemaining < 50
                        ? "text-yellow-400"
                        : "text-white/50"
                    }`}
                  >
                    {isOverLimit
                      ? `${Math.abs(charactersRemaining)} characters over limit`
                      : `${charactersRemaining} characters remaining`}
                  </span>
                </div>
              </div>

              {editError && <p className="text-red-400 text-sm">{editError}</p>}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors disabled:opacity-50"
                  aria-label="Cancel edit"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editContent.trim() || isOverLimit}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-md border border-white/10 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-opacity"
                  aria-label="Save edit"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              <p className="text-white/90 whitespace-pre-wrap mb-3">{post.content}</p>

              {/* Image */}
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="w-full rounded-xl object-cover max-h-96"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Footer Actions (hidden in edit mode) */}
        {!isEditing && (
          <div className="flex items-center gap-4 pt-3 border-t border-white/10">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={!currentUser || isLiking}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                likeData.isLiked
                  ? "bg-pink-500/20 text-pink-400"
                  : "bg-white/5 hover:bg-white/10 text-white/70"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={likeData.isLiked ? "Unlike post" : "Like post"}
            >
              <span className="text-lg">{likeData.isLiked ? "❤️" : "🤍"}</span>
              <span className="text-sm font-semibold">
                {likeData.count} {likeData.count === 1 ? "Like" : "Likes"}
              </span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
              aria-label={showComments ? "Hide comments" : "Show comments"}
            >
              <span className="text-lg">💬</span>
              <span className="text-sm font-semibold">
                {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
              </span>
            </button>
          </div>
        )}

        {/* Comments Section */}
        {showComments && !isEditing && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
            <CommentComposer postId={post.id} currentUser={currentUser} />
            <CommentList postId={post.id} currentUser={currentUser} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        title="Delete Post"
        message="Are you sure you want to delete this post? It will be marked as deleted and can only be permanently removed by an admin."
      />
    </>
  );
}
