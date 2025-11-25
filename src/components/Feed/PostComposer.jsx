"use client";
import { useState, useRef } from "react";
import { createPost, validateImage } from "@/lib/firebaseFeed";

const MAX_CONTENT_LENGTH = 1000;
const MAX_IMAGE_SIZE_MB = 5;

export default function PostComposer({ currentUser, onPostCreated }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    try {
      validateImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setImageFile(null);
      setImagePreview("");
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Please write something to share");
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`Post must be less than ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost({ content, imageFile });
      setContent("");
      setImageFile(null);
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      console.log("Post created successfully!");
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
        <p className="text-white/70 text-center">
          Please sign in to share posts
        </p>
      </div>
    );
  }

  const charactersRemaining = MAX_CONTENT_LENGTH - content.length;
  const isOverLimit = charactersRemaining < 0;

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6">
      <div className="flex gap-4">
        {/* User Avatar */}
        {currentUser.photoURL && (
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName || "User"}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        )}

        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Content Textarea */}
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`What's on your mind, ${currentUser.displayName || "friend"}?`}
                className={`w-full bg-white/5 focus:bg-white/10 border ${
                  isOverLimit ? "border-red-500" : "border-white/10"
                } rounded-xl px-4 py-3 text-white placeholder-white/50 resize-none transition-colors focus:outline-none focus:ring-2 ${
                  isOverLimit ? "focus:ring-red-500/50" : "focus:ring-purple-500/50"
                }`}
                rows={3}
                disabled={isSubmitting}
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

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {imageFile && `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`}
                </div>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isSubmitting}
            />

            {/* Error Message */}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors disabled:opacity-50"
                disabled={isSubmitting || imageFile}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {imageFile ? "Image added" : `Add image (max ${MAX_IMAGE_SIZE_MB}MB)`}
                </span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !content.trim() || isOverLimit}
                className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-md border border-white/10 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-xl transition-opacity"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
