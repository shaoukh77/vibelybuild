/**
 * Authentication Middleware - Production-Ready
 * Verifies Firebase ID tokens from Authorization header
 * Supports Bearer token and legacy x-uid fallback
 */

import { auth } from './firebaseAdmin';

/**
 * Extract Bearer token from Authorization header
 * @param {Request} request - Next.js request object
 * @returns {string|null} Token or null if not found
 */
function extractBearerToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

/**
 * Verify Firebase ID token and return decoded token
 * @param {Request} request - Next.js request object
 * @returns {Promise<{uid: string, email?: string, name?: string}>} Decoded token
 * @throws {Error} If token is invalid or missing
 */
export async function verifyAuth(request) {
  const token = extractBearerToken(request);

  if (!token) {
    throw new Error('No authentication token provided');
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid authentication token');
  }
}

/**
 * Verify Firebase ID token or fallback to custom headers (backward compatibility)
 * @param {Request} request - Next.js request object
 * @returns {Promise<{uid: string, email?: string, name?: string}>} User info
 * @throws {Error} If no valid auth found
 */
export async function verifyAuthWithFallback(request) {
  // Try Bearer token first (production method)
  const token = extractBearerToken(request);

  if (token) {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };
    } catch (error) {
      console.error('[Auth] Token verification failed:', error.message);
      throw new Error('Invalid authentication token');
    }
  }

  // Fallback: x-uid header (DEVELOPMENT ONLY)
  const xUid = request.headers.get('x-uid');

  if (xUid && process.env.NODE_ENV === 'development') {
    console.warn('[Auth] ⚠️ Using x-uid fallback (development only)');
    return {
      uid: xUid,
      email: `dev-${xUid}@example.com`,
      name: `Dev User ${xUid}`,
    };
  }

  // No valid authentication method found
  throw new Error('No authentication token provided');
}

/**
 * Verify user ownership of a resource
 * @param {Request} request - Next.js Request object
 * @param {string} resourceUserId - User ID from the resource
 * @returns {Promise<Object>} User info if authorized
 * @throws {Error} If user doesn't own the resource
 */
export async function verifyOwnership(request, resourceUserId) {
  const user = await verifyAuthWithFallback(request);

  if (user.uid !== resourceUserId) {
    throw new Error('Unauthorized: You do not own this resource');
  }

  return user;
}

/**
 * Middleware wrapper for API routes
 * Usage: export const POST = withAuth(async (request, { user }) => { ... })
 */
export function withAuth(handler) {
  return async (request, context = {}) => {
    try {
      const user = await verifyAuthWithFallback(request);

      // Add user to context
      const enhancedContext = {
        ...context,
        user,
      };

      return await handler(request, enhancedContext);

    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
          code: 'UNAUTHORIZED',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}
