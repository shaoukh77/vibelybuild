"use client";
import { useState } from "react";
import { addComment } from "@/lib/firebaseFeed";

export default function CommentComposer({ postId, currentUser }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(postId, { content });
      setContent("");
      console.log("Comment added successfully!");
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <p className="text-white/50 text-sm text-center py-2">
        Sign in to comment
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      {currentUser.photoURL && (
        <img
          src={currentUser.photoURL}
          alt={currentUser.displayName || "User"}
          className="w-8 h-8 rounded-full object-cover"
        />
      )}

      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 bg-white/5 focus:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        disabled={isSubmitting}
      />

      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-md border border-white/10 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl text-sm transition-opacity"
      >
        {isSubmitting ? "..." : "Reply"}
      </button>
    </form>
  );
}
