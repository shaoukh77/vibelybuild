/**
 * Backend API Client
 *
 * Secure communication with backend preview server on Railway/Render.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_SECRET = process.env.API_SECRET_KEY;

interface BackendResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
}

/**
 * Make authenticated request to backend
 */
async function backendFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add API secret for authentication
  if (API_SECRET) {
    headers['Authorization'] = `Bearer ${API_SECRET}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Backend request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[BackendClient] Error:', error);
    throw error;
  }
}

/**
 * Start a preview on the backend server
 */
export async function startBackendPreview(
  buildId: string,
  projectPath: string,
  userId: string
): Promise<{
  buildId: string;
  url: string;
  port: number;
  status: string;
}> {
  const response = await backendFetch('/api/preview/start', {
    method: 'POST',
    body: JSON.stringify({ buildId, projectPath, userId }),
  });

  return response.preview;
}

/**
 * Get preview status from backend
 */
export async function getBackendPreview(buildId: string): Promise<{
  buildId: string;
  url: string;
  port: number;
  status: string;
  startTime: number;
} | null> {
  try {
    return await backendFetch(`/api/preview/${buildId}`);
  } catch (error) {
    return null;
  }
}

/**
 * Stop a preview on the backend
 */
export async function stopBackendPreview(buildId: string): Promise<boolean> {
  try {
    const response = await backendFetch(`/api/preview/${buildId}/stop`, {
      method: 'POST',
    });
    return response.success;
  } catch (error) {
    return false;
  }
}

/**
 * List all active previews
 */
export async function listBackendPreviews(): Promise<{
  count: number;
  previews: Array<{
    buildId: string;
    url: string;
    port: number;
    status: string;
    uptime: number;
  }>;
}> {
  return await backendFetch('/api/previews');
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<{
  status: string;
  timestamp: string;
  uptime: number;
  env: string;
}> {
  return await backendFetch('/health');
}
