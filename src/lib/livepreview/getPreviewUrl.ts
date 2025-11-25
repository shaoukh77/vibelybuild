/**
 * Get Preview URL Utility
 *
 * Helper functions to get and manage preview URLs for builds.
 */

import { getPreview, getPreviewUrl as getPreviewUrlFromManager } from '../../../server/preview/previewManager';

/**
 * Get preview URL for a build ID
 *
 * @param buildId - The build/job ID
 * @returns Preview URL or null if not found
 */
export function getPreviewUrl(buildId: string): string | null {
  return getPreviewUrlFromManager(buildId);
}

/**
 * Get full preview info for a build ID
 *
 * @param buildId - The build/job ID
 * @returns Preview server info or null
 */
export function getPreviewInfo(buildId: string) {
  return getPreview(buildId);
}

/**
 * Check if preview is ready
 *
 * @param buildId - The build/job ID
 * @returns True if preview is ready
 */
export function isPreviewReady(buildId: string): boolean {
  const preview = getPreview(buildId);
  return preview !== null && preview.status === 'ready';
}

/**
 * Check if preview exists (regardless of status)
 *
 * @param buildId - The build/job ID
 * @returns True if preview exists
 */
export function hasPreview(buildId: string): boolean {
  return getPreview(buildId) !== null;
}

/**
 * Get preview status string
 *
 * @param buildId - The build/job ID
 * @returns Status string or 'not_found'
 */
export function getPreviewStatus(buildId: string): 'starting' | 'ready' | 'error' | 'not_found' {
  const preview = getPreview(buildId);
  return preview ? preview.status : 'not_found';
}
