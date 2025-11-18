"use client";

export default function ConfirmDeleteModal({ isOpen, onConfirm, onCancel, title, message }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-blue-900/95 border border-white/20 backdrop-blur-md rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Title */}
        <h2
          id="delete-modal-title"
          className="text-xl font-bold text-white mb-2"
        >
          {title || "Confirm Delete"}
        </h2>

        {/* Message */}
        <p className="text-white/80 mb-6">
          {message || "Are you sure you want to delete this post? This action cannot be undone."}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            aria-label="Cancel delete"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white font-semibold transition-opacity"
            aria-label="Confirm delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
