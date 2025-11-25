/**
 * Preview Store - State management for Live Preview Panel
 * Handles file tree, selected file, and preview content
 */

import { create } from 'zustand';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export interface PreviewState {
  // File tree structure
  fileTree: FileNode | null;

  // Selected file
  selectedFile: string | null;

  // File content
  fileContent: string | null;

  // Component preview (if available)
  componentPreview: string | null;

  // Loading states
  isLoadingTree: boolean;
  isLoadingContent: boolean;

  // Actions
  setFileTree: (tree: FileNode | null) => void;
  setSelectedFile: (path: string | null) => void;
  setFileContent: (content: string | null) => void;
  setComponentPreview: (preview: string | null) => void;
  setLoadingTree: (loading: boolean) => void;
  setLoadingContent: (loading: boolean) => void;
  reset: () => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  fileTree: null,
  selectedFile: null,
  fileContent: null,
  componentPreview: null,
  isLoadingTree: false,
  isLoadingContent: false,

  setFileTree: (tree) => set({ fileTree: tree }),
  setSelectedFile: (path) => set({ selectedFile: path }),
  setFileContent: (content) => set({ fileContent: content }),
  setComponentPreview: (preview) => set({ componentPreview: preview }),
  setLoadingTree: (loading) => set({ isLoadingTree: loading }),
  setLoadingContent: (loading) => set({ isLoadingContent: loading }),

  reset: () => set({
    fileTree: null,
    selectedFile: null,
    fileContent: null,
    componentPreview: null,
    isLoadingTree: false,
    isLoadingContent: false,
  }),
}));
