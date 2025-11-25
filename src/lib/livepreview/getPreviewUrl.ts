/**
 * Get Preview URL Utility - Serverless Edition
 *
 * Helper functions to get and manage preview URLs for builds.
 * Adapted for serverless deployment without preview manager.
 */

interface PreviewInfo {
  buildId: string;
  url: string;
  status: 'starting' | 'ready' | 'error';
}

/**
 * Get preview URL for a build ID
 *
 * @param buildId - The build/job ID
 * @returns Preview URL or null if not found
 */
export function getPreviewUrl(buildId: string): string | null {
  if (!buildId) return null;
  return `/api/preview/${buildId}`;
}

/**
 * Get full preview info for a build ID
 *
 * @param buildId - The build/job ID
 * @returns Preview server info or null
 */
export function getPreviewInfo(buildId: string): PreviewInfo | null {
  if (!buildId) return null;

  return {
    buildId,
    url: `/api/preview/${buildId}`,
    status: 'ready'
  };
}

/**
 * Check if preview is ready
 *
 * @param buildId - The build/job ID
 * @returns True if preview is ready
 */
export function isPreviewReady(buildId: string): boolean {
  return !!buildId;
}

/**
 * Check if preview exists (regardless of status)
 *
 * @param buildId - The build/job ID
 * @returns True if preview exists
 */
export function hasPreview(buildId: string): boolean {
  return !!buildId;
}

/**
 * Get preview status string
 *
 * @param buildId - The build/job ID
 * @returns Status string or 'not_found'
 */
export function getPreviewStatus(buildId: string): 'starting' | 'ready' | 'error' | 'not_found' {
  return buildId ? 'ready' : 'not_found';
}
