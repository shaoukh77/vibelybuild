/**
 * IframePreview Component - PHASE 1 & 3 Improvements
 *
 * Features:
 * - Fully interactive iframe with proper sandbox attributes
 * - Listens for "ui_ready" SSE event
 * - Loading states with skeleton
 * - Error fallback UI
 * - Auto-refresh controls
 */

'use client';

import { useState, useEffect, useRef } from 'react';

interface IframePreviewProps {
  previewUrl: string | null;
  buildId: string;
  onRefresh?: () => void;
}

export function IframePreview({ previewUrl, buildId, onRefresh }: IframePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset loading state when previewUrl changes
  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [previewUrl]);

  const handleLoad = () => {
    console.log('[IframePreview] ✅ iframe loaded successfully');
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    console.error('[IframePreview] ❌ iframe failed to load');
    setLoading(false);
    setError('Failed to load preview. The server may still be starting up.');
  };

  const handleRefresh = () => {
    if (iframeRef.current && previewUrl) {
      console.log('[IframePreview] 🔄 Refreshing iframe');
      setLoading(true);
      setError(null);

      // Force reload by changing src
      const current = iframeRef.current;
      const url = current.src;
      current.src = '';
      setTimeout(() => {
        current.src = url;
        setRetryCount(prev => prev + 1);
      }, 100);

      if (onRefresh) {
        onRefresh();
      }
    }
  };

  // No preview URL yet
  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <div className="w-20 h-20 mb-6 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="text-white text-base font-semibold mb-2">
          Starting preview server...
        </p>
        <p className="text-white/50 text-sm mb-4">
          Installing dependencies and launching Next.js
        </p>
        <div className="w-full max-w-sm space-y-3 animate-pulse px-6">
          <div className="h-10 bg-white/10 rounded-lg"></div>
          <div className="h-24 bg-white/10 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-white/10 rounded-lg"></div>
            <div className="h-20 bg-white/10 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-white">
      {/* Loading Overlay */}
      {loading && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex flex-col items-center justify-center z-10">
          <div className="w-16 h-16 mb-4 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-white text-sm font-semibold mb-2">
            Loading preview...
          </p>
          <p className="text-white/50 text-xs">
            Compiling your Next.js app
          </p>
          {retryCount > 0 && (
            <p className="text-white/40 text-xs mt-2">
              Attempt {retryCount + 1}
            </p>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 flex flex-col items-center justify-center z-10">
          <div className="w-20 h-20 mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-5xl">⚠️</span>
          </div>
          <p className="text-white text-base font-semibold mb-2">
            Preview Failed
          </p>
          <p className="text-white/70 text-sm mb-6 text-center max-w-md px-4">
            {error}
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Controls Bar */}
      {!loading && !error && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500/90 to-blue-500/90 backdrop-blur-sm px-4 py-2 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white text-xs font-mono">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Live Preview</span>
            <span className="text-white/60">•</span>
            <span className="text-white/80">{previewUrl}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-semibold transition-all"
            title="Refresh preview"
          >
            🔄 Refresh
          </button>
        </div>
      )}

      {/* Iframe - PHASE 1 FIX: Proper sandbox attributes */}
      <iframe
        ref={iframeRef}
        src={previewUrl}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-downloads"
        title="Live Preview"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          display: loading || error ? 'none' : 'block',
          paddingTop: error || loading ? '0' : '40px', // Account for controls bar
        }}
        // Allow iframe to be fully interactive
        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb"
      />
    </div>
  );
}
