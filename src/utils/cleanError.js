/**
 * Error Cleaning Utility
 * Sanitizes errors for client consumption
 */

export function cleanError(error) {
  // Never expose internal errors in production
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    return {
      message: error.message || 'An error occurred',
      stack: error.stack,
      details: error
    };
  }

  // Production: Generic messages only
  const message = getPublicErrorMessage(error);

  return {
    message,
    code: error.code || 'INTERNAL_ERROR'
  };
}

function getPublicErrorMessage(error) {
  const message = error.message || '';

  // Map specific errors to user-friendly messages
  if (message.includes('auth')) {
    return 'Authentication failed. Please sign in again.';
  }

  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'You do not have permission to perform this action.';
  }

  if (message.includes('not found')) {
    return 'The requested resource was not found.';
  }

  if (message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  if (message.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}

export function logError(context, error) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${context}]`, {
    message: error.message,
    stack: error.stack,
    ...(error.code && { code: error.code })
  });
}
