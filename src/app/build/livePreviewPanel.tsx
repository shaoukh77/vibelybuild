/**
 * Live Preview Panel - PHASE 3 Complete Rewrite
 *
 * Features:
 * - Tab 1: UI Preview (iframe with IframePreview component)
 * - Tab 2: Code Viewer (syntax-highlighted code)
 * - Tab 3: File Tree (file navigator)
 * - Listens for "ui_ready" SSE event
 * - Auto-switches to preview tab when ui_ready fires
 * - Smooth transitions and loading states
 */

'use client';

import { useState, useEffect } from 'react';
import { FileTreeRoot } from './components/FileTree';
import { IframePreview as LocalIframePreview } from './components/IframePreview';
import { IframePreview } from '@/components/IframePreview';
import { PreviewTabs, PreviewTab } from '@/components/PreviewTabs';
import { authFetch } from '@/lib/authFetch';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface LivePreviewPanelProps {
  jobId: string | null;
  buildComplete?: boolean;
  user?: any;
  fileTreeFromSSE?: string[] | null;
  previewUrlFromSSE?: string | null;
  uiReadyUrl?: string | null; // NEW: Listen for ui_ready event
}

// Use PreviewTab type from the component

export function LivePreviewPanel({
  jobId,
  buildComplete,
  user,
  fileTreeFromSSE,
  previewUrlFromSSE,
  uiReadyUrl,
}: LivePreviewPanelProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<PreviewTab>('preview');

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uiReady, setUiReady] = useState(false);

  // File tree state
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Reset when jobId changes
  useEffect(() => {
    setFileTree(null);
    setSelectedFile(null);
    setFileContent(null);
    setPreviewUrl(null);
    setUiReady(false);
    setActiveTab('preview');
  }, [jobId]);

  // Update preview URL from SSE (preview_ready event)
  useEffect(() => {
    if (previewUrlFromSSE) {
      console.log('[LivePreview] 🎬 Received preview URL from SSE:', previewUrlFromSSE);
      setPreviewUrl(previewUrlFromSSE);
    }
  }, [previewUrlFromSSE]);

  // PHASE 3: Listen for ui_ready event
  useEffect(() => {
    if (uiReadyUrl) {
      console.log('[LivePreview] ✅ UI READY event received:', uiReadyUrl);
      setPreviewUrl(uiReadyUrl);
      setUiReady(true);

      // Auto-switch to preview tab when UI is ready
      setActiveTab('preview');
    }
  }, [uiReadyUrl]);

  // Update file tree from SSE
  useEffect(() => {
    if (fileTreeFromSSE && fileTreeFromSSE.length > 0) {
      console.log('[LivePreview] 📁 Updating file tree from SSE:', fileTreeFromSSE.length, 'files');
      const tree = buildFileTree(fileTreeFromSSE);
      setFileTree(tree);

      // Auto-select first code file if nothing is selected
      if (!selectedFile && fileTreeFromSSE.length > 0) {
        const firstCodeFile =
          fileTreeFromSSE.find(
            (f: string) =>
              f.endsWith('.tsx') ||
              f.endsWith('.ts') ||
              f.endsWith('.jsx') ||
              f.endsWith('.js')
          ) || fileTreeFromSSE[0];

        if (jobId) {
          loadFileContent(jobId, firstCodeFile);
        }
      }
    }
  }, [fileTreeFromSSE]);

  // Load file tree from API (fallback if SSE doesn't provide it)
  useEffect(() => {
    if (buildComplete && jobId && !fileTree && !fileTreeFromSSE) {
      loadFileTree(jobId);
    }
  }, [buildComplete, jobId, fileTree, fileTreeFromSSE]);

  // Load file tree from API
  const loadFileTree = async (jobId: string) => {
    setIsLoadingTree(true);
    try {
      const response = await authFetch(`/api/generated/files?jobId=${jobId}`);
      const data = await response.json();

      const fileList = data.files || data.structure || [];
      const tree = buildFileTree(fileList);
      setFileTree(tree);

      if (fileList.length > 0) {
        const firstCodeFile =
          fileList.find(
            (f: string) =>
              f.endsWith('.tsx') ||
              f.endsWith('.ts') ||
              f.endsWith('.jsx') ||
              f.endsWith('.js')
          ) || fileList[0];

        loadFileContent(jobId, firstCodeFile);
      }
    } catch (error) {
      console.error('[LivePreview] Failed to load file tree:', error);
    } finally {
      setIsLoadingTree(false);
    }
  };

  // Load file content from API
  const loadFileContent = async (jobId: string, filePath: string) => {
    setIsLoadingContent(true);
    setSelectedFile(filePath);

    try {
      const response = await authFetch(
        `/api/generated/file?jobId=${jobId}&path=${encodeURIComponent(filePath)}`
      );
      const data = await response.json();
      setFileContent(data.content || '// File is empty');
    } catch (error) {
      console.error('[LivePreview] Failed to load file content:', error);
      setFileContent('// Error loading file');
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Handle file selection
  const handleSelectFile = (path: string) => {
    if (jobId) {
      loadFileContent(jobId, path);
    }
  };

  // No job selected
  if (!jobId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-24 h-24 mb-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full flex items-center justify-center">
          <span className="text-6xl">👁️</span>
        </div>
        <p className="text-white text-lg font-semibold mb-2">No preview yet</p>
        <p className="text-white/50 text-sm">
          Build an app to see a live preview
        </p>
      </div>
    );
  }

  // Build in progress - show "Generating UI..." state
  if (!buildComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
        <div className="w-16 sm:w-20 h-16 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-4xl sm:text-5xl">⚙️</span>
        </div>
        <p className="text-white text-base sm:text-lg font-bold mb-2">Generating UI...</p>
        <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-6">
          Building your app from your idea
        </p>
        {/* Progress indicators */}
        <div className="space-y-2 mb-6 text-white/50 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span>Generating code files</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <span>Setting up project structure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            <span>Preparing preview server</span>
          </div>
        </div>
        {/* Skeleton */}
        <div className="w-full max-w-xs space-y-3 sm:space-y-4 animate-pulse">
          <div className="h-10 sm:h-12 bg-white/10 rounded-lg"></div>
          <div className="h-24 sm:h-32 bg-white/10 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="h-20 sm:h-24 bg-white/10 rounded-lg"></div>
            <div className="h-20 sm:h-24 bg-white/10 rounded-lg"></div>
          </div>
          <div className="h-8 sm:h-10 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Build complete - show tabs with new PreviewTabs component
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab Bar - Using new PreviewTabs component */}
      <PreviewTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        uiReady={uiReady}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* Tab 1: UI Preview (iframe) - Using new IframePreview component */}
        {activeTab === 'preview' && (
          <IframePreview
            previewUrl={previewUrl}
            buildId={jobId}
            onRefresh={() => {
              console.log('[LivePreview] Refresh requested');
              // Could implement reload logic here
            }}
            className="h-full"
          />
        )}

        {/* Tab 2: Code Viewer */}
        {activeTab === 'code' && (
          <div className="h-full flex flex-col bg-[#0d1117]">
            {selectedFile ? (
              <>
                {/* File header */}
                <div className="px-3 py-2 border-b border-white/10 bg-white/5">
                  <div className="text-xs text-white/70 font-mono truncate flex items-center gap-2">
                    <span className="text-purple-400">📄</span>
                    <span>{selectedFile}</span>
                  </div>
                </div>

                {/* Code content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {isLoadingContent ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-white/50 text-xs animate-pulse">
                        Loading...
                      </div>
                    </div>
                  ) : (
                    <pre className="text-xs font-mono text-green-400 p-4 leading-relaxed">
                      <code>{fileContent || '// Empty file'}</code>
                    </pre>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white/50 text-sm">
                Select a file from the File Tree tab
              </div>
            )}
          </div>
        )}

        {/* Tab 3: File Tree */}
        {activeTab === 'files' && (
          <div className="h-full p-3 overflow-y-auto custom-scrollbar bg-[#0d1117]">
            <div className="text-xs font-semibold text-white/70 mb-2 flex items-center gap-2">
              <span>📁</span>
              <span>Generated Files</span>
            </div>
            <FileTreeRoot
              tree={fileTree}
              selectedFile={selectedFile}
              onSelectFile={(path) => {
                handleSelectFile(path);
                setActiveTab('code'); // Auto-switch to code viewer
              }}
              isLoading={isLoadingTree}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Build file tree from flat file list
 */
function buildFileTree(files: string[]): FileNode {
  const root: FileNode = {
    name: 'root',
    path: '',
    type: 'folder',
    children: [],
  };

  if (!files || files.length === 0) {
    return root;
  }

  files.forEach((filePath) => {
    const parts = filePath.split('/').filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const path = parts.slice(0, index + 1).join('/');

      // Check if node exists
      let node = current.children?.find((child) => child.name === part);

      if (!node) {
        node = {
          name: part,
          path: isFile ? filePath : path,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
        };
        current.children?.push(node);
      }

      if (!isFile) {
        current = node;
      }
    });
  });

  return root;
}
