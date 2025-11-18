import { auth } from './firebase';

/**
 * Get current Firebase auth user
 */
export function getClientUser() {
  const user = auth.currentUser;
  if (!user) return null;

  return {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
    photoURL: user.photoURL || '',
    email: user.email || '',
  };
}

/**
 * Get headers for API requests with user info
 */
export function getUserHeaders() {
  const user = getClientUser();
  if (!user) return {};

  return {
    'x-uid': user.uid,
    'x-name': user.displayName,
    'x-photo': user.photoURL,
  };
}
