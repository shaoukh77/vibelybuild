/**
 * Authenticated Fetch Helper - Production-Ready
 * Automatically adds Firebase ID token to all API requests
 * Detects HTML responses and throws errors
 * Always returns JSON only
 */

import { auth } from './firebase';

/**
 * Get current user's Firebase ID token
 * @returns {Promise<string|null>} ID token or null if not authenticated
 */
export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
}

/**
 * Authenticated fetch wrapper
 * Automatically includes Firebase ID token in Authorization header
 *
 * @param {string} url - API endpoint URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function authFetch(url, options = {}) {
  const token = await getIdToken();

  // Merge headers with auth token
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Detect HTML responses (should never happen in production)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    const text = await response.text();
    console.error('[authFetch] ❌ Server returned HTML instead of JSON:', text.substring(0, 200));
    throw new Error('Server returned HTML instead of JSON - check API endpoint');
  }

  // Validate response is JSON before returning
  if (!response.ok) {
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    } else {
      // Server returned non-JSON response
      const text = await response.text();
      console.error('[authFetch] API returned non-JSON:', text.substring(0, 200));
      throw new Error(`Server error: ${response.status}`);
    }
  }

  return response;
}

/**
 * Helper to validate response and parse JSON
 * @param {Response} response - Fetch response
 * @returns {Promise<any>} Parsed JSON data
 */
export async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Expected JSON but got:', text.substring(0, 200));
    throw new Error('Invalid response format');
  }

  return response.json();
}
