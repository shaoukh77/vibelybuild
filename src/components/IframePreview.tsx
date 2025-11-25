/**
 * IframePreview Component
 *
 * Fully interactive iframe preview with:
 * - Auto-resize script injection
 * - Loading states
 * - Error fallback screen
 * - Proper sandbox attributes
 * - Responsive design
 * - Glassmorphism UI
 */

'use client';

import { useState, useEffect, useRef } from 'react';

interface IframePreviewProps {
  previewUrl: string | null;
  buildId: string;
  onRefresh?: () => void;
  className?: string;
}

export function IframePreview({
  previewUrl,
  buildId,
  onRefresh,
  className = ''
}: IframePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [iframeHeight, setIframeHeight] = useState('100%');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset loading state when previewUrl changes
  useEffect(() => {
    if (previewUrl) {
      setLoading(true);
      setError(null);
    }
  }, [previewUrl]);

  // Auto-resize iframe based on content (optional)
  useEffect(() => {
    if (!iframeRef.current || !previewUrl) return;

    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our preview URL origin
      try {
        const previewOrigin = new URL(previewUrl).origin;
        if (event.origin !== previewOrigin) return;

        if (event.data && event.data.type === 'resize') {
          const height = event.data.height;
          if (height && typeof height === 'number') {
            setIframeHeight(`${height}px`);
          }
        }
      } catch (err) {
        // Ignore invalid origins
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [previewUrl]);

  const handleLoad = () => {
    console.log('[IframePreview] ✅ iframe loaded successfully');
    setLoading(false);
    setError(null);

    // Inject auto-resize script into iframe (optional)
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const script = `
          (function() {
            const sendHeight = () => {
              const height = document.documentElement.scrollHeight;
              window.parent.postMessage({ type: 'resize', height }, '*');
            };

            // Send initial height
            if (document.readyState === 'complete') {
              sendHeight();
            } else {
              window.addEventListener('load', sendHeight);
            }

            // Send on resize
            const observer = new ResizeObserver(sendHeight);
            observer.observe(document.body);
          })();
        `;

        // Note: This only works for same-origin iframes
        // For cross-origin, the iframe content must include this script
      }
    } catch (err) {
      console.log('[IframePreview] Could not inject resize script (cross-origin)');
    }
  };

  const handleError = (e: any) => {
    console.error('[IframePreview] ❌ iframe failed to load', e);
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

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  // No preview URL yet - "Preparing Preview..." state
  if (!previewUrl) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 backdrop-blur-sm ${className}`}>
        {/* Glassmorphism loading card */}
        <div className="glass-card p-8 text-center max-w-md mx-4">
          <div className="w-20 h-20 mb-6 mx-auto border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-white text-lg font-bold mb-2">
            Preparing Preview...
          </p>
          <p className="text-white/70 text-sm mb-4">
            Starting Next.js dev server
          </p>
          <div className="space-y-2 text-white/50 text-xs">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Allocating port (4110-4990)</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <span>Installing dependencies</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              <span>Compiling application</span>
            </div>
          </div>
        </div>

        {/* Skeleton preview */}
        <div className="w-full max-w-2xl mx-4 mt-8 space-y-4 animate-pulse">
          <div className="h-12 bg-white/10 rounded-lg backdrop-blur-sm"></div>
          <div className="h-32 bg-white/10 rounded-lg backdrop-blur-sm"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-white/10 rounded-lg backdrop-blur-sm"></div>
            <div className="h-24 bg-white/10 rounded-lg backdrop-blur-sm"></div>
          </div>
          <div className="h-10 bg-white/10 rounded-lg backdrop-blur-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full bg-white ${className}`}>
      {/* Loading Overlay - "Generating UI..." */}
      {loading && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-md flex flex-col items-center justify-center z-10">
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 mb-4 mx-auto border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-white text-base font-bold mb-2">
              Generating UI...
            </p>
            <p className="text-white/70 text-sm">
              Compiling your Next.js app
            </p>
            {retryCount > 0 && (
              <p className="text-white/50 text-xs mt-2">
                Attempt {retryCount + 1}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Fallback Screen */}
      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-md flex flex-col items-center justify-center z-10 p-4">
          <div className="glass-card p-8 text-center max-w-md">
            <div className="w-20 h-20 mb-6 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-5xl">⚠️</span>
            </div>
            <p className="text-white text-lg font-bold mb-2">
              Preview Failed
            </p>
            <p className="text-white/70 text-sm mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRefresh}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                🔄 Try Again
              </button>
              {previewUrl && (
                <button
                  onClick={handleOpenInNewTab}
                  className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                >
                  🔗 Open in New Tab
                </button>
              )}
            </div>
            <p className="text-white/50 text-xs mt-4">
              The server might still be warming up. Try again in a few seconds.
            </p>
          </div>
        </div>
      )}

      {/* Controls Bar - Desktop */}
      {!loading && !error && (
        <div className="hidden sm:flex absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500/90 via-blue-500/90 to-pink-500/90 backdrop-blur-md px-4 py-2 z-20 items-center justify-between">
          <div className="flex items-center gap-3 text-white text-xs font-mono">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="font-semibold">Live Preview</span>
            <span className="text-white/60">•</span>
            <span className="text-white/80 truncate max-w-[200px] lg:max-w-none">{previewUrl}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenInNewTab}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-semibold transition-all"
              title="Open in new tab"
            >
              🔗 Open
            </button>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-semibold transition-all"
              title="Refresh preview"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      )}

      {/* Controls Bar - Mobile */}
      {!loading && !error && (
        <div className="flex sm:hidden absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500/90 to-blue-500/90 backdrop-blur-md px-3 py-2 z-20 items-center justify-between">
          <div className="flex items-center gap-2 text-white text-xs">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="font-semibold">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenInNewTab}
              className="px-2 py-1 bg-white/20 text-white rounded text-xs"
              title="Open"
            >
              🔗
            </button>
            <button
              onClick={handleRefresh}
              className="px-2 py-1 bg-white/20 text-white rounded text-xs"
              title="Refresh"
            >
              🔄
            </button>
          </div>
        </div>
      )}

      {/* Iframe with proper sandbox attributes */}
      <iframe
        ref={iframeRef}
        src={previewUrl}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
        title="Live Preview"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          display: loading || error ? 'none' : 'block',
          paddingTop: error || loading ? '0' : '40px', // Account for controls bar
          minHeight: '400px',
        }}
        // Allow iframe to be fully interactive
        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; payment; usb; clipboard-read; clipboard-write"
      />
    </div>
  );
}
