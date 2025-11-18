"use client";
import { useState } from "react";

export default function PublishDialog({ open, onClose, onConfirm, buildPrompt }) {
  const [title, setTitle] = useState(buildPrompt?.substring(0, 50) || "");
  const [description, setDescription] = useState(buildPrompt || "");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setLoading(true);
    try {
      await onConfirm({ title: title.trim(), description: description.trim() });
      // Reset form
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Publish error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="glass section max-w-md w-full text-white animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-xl">Publish to Store</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white/50 hover:text-white text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white/70 mb-1 block">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome App"
              className="w-full bg-white/10 text-white placeholder-white/50 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-white/30"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/70 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your app..."
              className="w-full bg-white/10 text-white placeholder-white/50 px-3 py-2 rounded-lg outline-none resize-none focus:ring-2 focus:ring-white/30"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="pill bg-white/10 hover:bg-white/20 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="pill bg-white/30 text-black font-semibold hover:bg-white/40 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
