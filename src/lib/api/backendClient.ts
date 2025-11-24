/**
 * Backend API Client (Serverless Edition)
 *
 * All backend functionality now runs as Next.js API routes.
 * No external backend server needed - fully Vercel-compatible!
 */

import { authFetch } from '../authFetch';

interface BackendResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
}

/**
 * Get preview status
 */
export async function getBackendPreview(buildId: string): Promise<{
  buildId: string;
  url: string | null;
  status: string;
} | null> {
  try {
    const response = await authFetch(`/api/build/preview?jobId=${buildId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[BackendClient] Failed to get preview:', error);
    return null;
  }
}

/**
 * Start a preview (for serverless, this just checks if build is complete)
 */
export async function startBackendPreview(
  buildId: string,
  projectPath: string,
  userId: string
): Promise<{
  buildId: string;
  url: string | null;
  status: string;
}> {
  try {
    // For serverless, we just check the preview status
    const response = await authFetch(`/api/build/preview?jobId=${buildId}`);
    const data = await response.json();

    return {
      buildId: data.buildId,
      url: data.url,
      status: data.status,
    };
  } catch (error: any) {
    console.error('[BackendClient] Failed to start preview:', error);
    throw error;
  }
}

/**
 * Stop a preview (no-op for serverless)
 */
export async function stopBackendPreview(buildId: string): Promise<boolean> {
  try {
    const response = await authFetch(`/api/build/preview/stop`, {
      method: 'POST',
      body: JSON.stringify({ jobId: buildId }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('[BackendClient] Failed to stop preview:', error);
    return false;
  }
}

/**
 * Restart a preview (for serverless, just refreshes the URL)
 */
export async function restartBackendPreview(buildId: string): Promise<{
  buildId: string;
  url: string | null;
  status: string;
}> {
  try {
    const response = await authFetch(`/api/build/preview/restart`, {
      method: 'POST',
      body: JSON.stringify({ jobId: buildId }),
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[BackendClient] Failed to restart preview:', error);
    throw error;
  }
}

/**
 * List all active previews
 * Note: For serverless, this would need to query the job registry
 */
export async function listBackendPreviews(): Promise<{
  count: number;
  previews: Array<{
    buildId: string;
    url: string;
    status: string;
  }>;
}> {
  // For serverless, we'd need to implement a job listing endpoint
  // For now, return empty array
  console.warn('[BackendClient] listBackendPreviews not implemented for serverless');
  return {
    count: 0,
    previews: [],
  };
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<{
  status: string;
  timestamp: string;
  uptime?: number;
  env?: string;
}> {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[BackendClient] Health check failed:', error);
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
    };
  }
}
