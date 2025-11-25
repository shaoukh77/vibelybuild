/**
 * User Verification Middleware
 * Verifies Firebase ID tokens from Authorization header
 */

import { auth } from './firebaseAdmin';
import { cleanError } from '@/utils/cleanError';

/**
 * Extract Bearer token from Authorization header
 * @param {Request} request - Request object
 * @returns {string|null} Token or null
 */
function extractBearerToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

/**
 * Verify user authentication
 * @param {Request} request - Request object
 * @returns {Promise<{uid: string, email?: string, name?: string}>} User info
 * @throws {Error} If authentication fails
 */
export async function verifyUser(request) {
  const token = extractBearerToken(request);

  if (!token) {
    const error = new Error('No authentication token provided');
    error.code = 'AUTH_MISSING';
    throw error;
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    };
  } catch (error) {
    console.error('[VerifyUser] Token verification failed:', error);

    const authError = new Error('Invalid authentication token');
    authError.code = 'AUTH_INVALID';
    throw authError;
  }
}

/**
 * Middleware wrapper for API routes
 * @param {Function} handler - Route handler function
 * @returns {Function} Wrapped handler
 */
export function withAuth(handler) {
  return async (request, context) => {
    try {
      const user = await verifyUser(request);

      // Add user to context
      const enhancedContext = {
        ...context,
        user
      };

      return await handler(request, enhancedContext);

    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code || 'INTERNAL_ERROR'
        }),
        {
          status: error.code === 'AUTH_MISSING' ? 401 : 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

/**
 * Verify user and match with userId in request
 * @param {Request} request - Request object
 * @param {string} userId - Expected user ID
 * @returns {Promise<void>}
 * @throws {Error} If user doesn't match
 */
export async function verifyUserOwnership(request, userId) {
  const user = await verifyUser(request);

  if (user.uid !== userId) {
    const error = new Error('User ID mismatch - unauthorized');
    error.code = 'UNAUTHORIZED';
    throw error;
  }
}
