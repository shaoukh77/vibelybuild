/**
 * Builder API Client
 *
 * Handles all communication between frontend and backend builder API.
 * Deployed backend: https://vibelybuild.onrender.com
 */

import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Get Firebase ID token for authenticated requests
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

/**
 * Make authenticated API request
 */
async function authFetch(url: string, options: RequestInit = {}) {
  const token = await getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

export interface BuildRequest {
  prompt: string;
  target?: 'web' | 'ios' | 'android' | 'multi';
}

export interface BuildResponse {
  buildId: string;
  status: string;
  message: string;
}

export interface BuildStatus {
  buildId: string;
  userId: string;
  prompt: string;
  status: 'queued' | 'running' | 'complete' | 'failed';
  appName?: string;
  blueprint?: any;
  repoUrl?: string;
  artifactUrl?: string;
  deployStatus?: string;
  error?: string;
  createdAt: any;
  updatedAt: any;
  completedAt?: any;
}

export interface BuildLog {
  id: string;
  buildId: string;
  userId: string;
  message: string;
  level?: string;
  createdAt: any;
}

/**
 * Create a new build
 */
export async function createBuild(request: BuildRequest): Promise<BuildResponse> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const response = await authFetch(`${API_BASE_URL}/api/build`, {
    method: 'POST',
    body: JSON.stringify({
      prompt: request.prompt,
      target: request.target || 'web',
    }),
  });

  return response;
}

/**
 * Get build status
 */
export async function getBuildStatus(buildId: string): Promise<BuildStatus> {
  return authFetch(`${API_BASE_URL}/api/build/${buildId}`);
}

/**
 * List user's builds
 */
export async function listBuilds(): Promise<BuildStatus[]> {
  const response = await authFetch(`${API_BASE_URL}/api/build/list`);
  return response.builds || [];
}

/**
 * Subscribe to build logs via Server-Sent Events (SSE)
 */
export function subscribeToBuildLogs(
  buildId: string,
  callbacks: {
    onLog?: (log: { message: string; level?: string; timestamp?: number }) => void;
    onStatus?: (status: { status: string; appName?: string; repoUrl?: string; error?: string }) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
  }
): () => void {
  const user = auth.currentUser;
  if (!user) {
    callbacks.onError?.(new Error('User not authenticated'));
    return () => {};
  }

  let eventSource: EventSource | null = null;
  let isClosed = false;

  // Get token and connect
  user.getIdToken().then((token) => {
    if (isClosed) return;

    const url = `${API_BASE_URL}/api/build/stream?buildId=${buildId}`;
    eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'log':
            callbacks.onLog?.(data);
            break;
          case 'status':
            callbacks.onStatus?.(data);
            break;
          case 'done':
            callbacks.onComplete?.();
            eventSource?.close();
            break;
          case 'error':
            callbacks.onError?.(new Error(data.message || 'Stream error'));
            eventSource?.close();
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      callbacks.onError?.(new Error('Connection lost'));
      eventSource?.close();
    };
  }).catch((error) => {
    callbacks.onError?.(error);
  });

  // Return cleanup function
  return () => {
    isClosed = true;
    eventSource?.close();
  };
}

/**
 * Get preview URL for a build
 */
export function getPreviewUrl(buildId: string): string {
  return `${API_BASE_URL}/api/preview/${buildId}`;
}

/**
 * Get download URL for a build
 */
export function getDownloadUrl(buildId: string): string {
  return `${API_BASE_URL}/api/download/${buildId}`;
}

/**
 * Download build as ZIP file
 */
export async function downloadBuild(buildId: string): Promise<Blob> {
  const token = await getAuthToken();

  const response = await fetch(getDownloadUrl(buildId), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Download failed');
  }

  return response.blob();
}

/**
 * Trigger download in browser
 */
export async function triggerDownload(buildId: string, appName: string = 'app') {
  try {
    const blob = await downloadBuild(buildId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName}-${buildId}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Get preview data for a build (generated files)
 */
export async function getPreviewData(buildId: string): Promise<{
  files: Record<string, string>;
  entryPoint: string;
}> {
  return authFetch(`${API_BASE_URL}/api/preview/${buildId}`);
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return response.json();
}
