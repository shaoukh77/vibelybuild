/**
 * Preview API Helper
 *
 * Utility functions for fetching preview URLs and checking preview status
 */

import { authFetch } from '@/lib/authFetch';

export interface PreviewStatus {
  url: string | null;
  status: 'starting' | 'ready' | 'error' | 'not_found';
  error?: string;
  buildId: string;
  port?: number;
  startTime?: number;
}

/**
 * Fetch preview URL for a build
 */
export async function fetchPreviewUrl(jobId: string): Promise<PreviewStatus> {
  try {
    const response = await authFetch(`/api/build/preview?jobId=${jobId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          url: null,
          status: 'not_found',
          buildId: jobId,
          error: 'Preview not found',
        };
      }
      throw new Error(`Failed to fetch preview: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      url: data.url || null,
      status: data.status || 'starting',
      buildId: jobId,
      port: data.port,
      startTime: data.startTime,
      error: data.error,
    };
  } catch (error: any) {
    console.error('[fetchPreview] Error:', error);
    return {
      url: null,
      status: 'error',
      buildId: jobId,
      error: error.message || 'Failed to fetch preview',
    };
  }
}

/**
 * Poll preview URL until it's ready
 *
 * @param jobId - Build job ID
 * @param maxAttempts - Maximum number of polling attempts (default: 30)
 * @param interval - Polling interval in ms (default: 2000)
 * @returns Preview status
 */
export async function pollPreviewUrl(
  jobId: string,
  maxAttempts: number = 30,
  interval: number = 2000
): Promise<PreviewStatus> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const status = await fetchPreviewUrl(jobId);

    if (status.status === 'ready' && status.url) {
      console.log(`[pollPreviewUrl] Preview ready after ${attempts + 1} attempts`);
      return status;
    }

    if (status.status === 'error') {
      console.error('[pollPreviewUrl] Preview error:', status.error);
      return status;
    }

    attempts++;
    console.log(`[pollPreviewUrl] Waiting for preview... (${attempts}/${maxAttempts})`);

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  console.error('[pollPreviewUrl] Timeout waiting for preview');
  return {
    url: null,
    status: 'error',
    buildId: jobId,
    error: 'Timeout waiting for preview to be ready',
  };
}

/**
 * Check if preview server is healthy
 */
export async function checkPreviewHealth(previewUrl: string): Promise<boolean> {
  try {
    const response = await fetch(previewUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    });

    return response.ok || response.status === 404;
  } catch (error) {
    console.error('[checkPreviewHealth] Health check failed:', error);
    return false;
  }
}

/**
 * Refresh preview by restarting the server
 */
export async function refreshPreview(jobId: string): Promise<PreviewStatus> {
  try {
    const response = await authFetch(`/api/build/preview/restart`, {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to restart preview: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      url: data.url || null,
      status: data.status || 'starting',
      buildId: jobId,
      port: data.port,
      startTime: data.startTime,
    };
  } catch (error: any) {
    console.error('[refreshPreview] Error:', error);
    return {
      url: null,
      status: 'error',
      buildId: jobId,
      error: error.message || 'Failed to restart preview',
    };
  }
}

/**
 * Stop preview server for a build
 */
export async function stopPreview(jobId: string): Promise<boolean> {
  try {
    const response = await authFetch(`/api/build/preview/stop`, {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });

    return response.ok;
  } catch (error) {
    console.error('[stopPreview] Error:', error);
    return false;
  }
}
