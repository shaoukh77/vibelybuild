import { create } from 'zustand';

export const useUI = create((set) => ({
  // Build selection
  selectedBuildId: null,
  setSelectedBuildId: (id) => set({ selectedBuildId: id }),

  // Publish modal
  isPublishModalOpen: false,
  publishingBuildId: null,
  isPublishing: false,
  openPublishModal: (buildId) => set({ isPublishModalOpen: true, publishingBuildId: buildId }),
  closePublishModal: () => set({ isPublishModalOpen: false, publishingBuildId: null, isPublishing: false }),
  setIsPublishing: (value) => set({ isPublishing: value }),

  // General loading states
  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),
}));
