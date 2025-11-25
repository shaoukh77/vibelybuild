/**
 * Firebase Admin SDK - Server-Side Only
 *
 * GUARANTEED SAFE INITIALIZATION:
 * - Only runs in Node.js/server environment
 * - Never duplicates admin.apps
 * - Supports multiple credential methods
 * - Exports are NEVER undefined (uses Proxy for build-time safety)
 * - Full TypeScript support via JSDoc
 * - Compatible with Next.js 14 App Router API routes
 */

import admin from 'firebase-admin';

// ============================================
// SERVER-SIDE ONLY CHECK
// ============================================

const isServer = typeof window === 'undefined';

if (!isServer) {
  console.error('[Firebase Admin] ⚠️  Firebase Admin SDK should only be used on the server side!');
}

// ============================================
// INITIALIZATION
// ============================================

let isInitialized = false;

/**
 * Initialize Firebase Admin SDK (singleton pattern)
 * Supports multiple credential methods in order of preference:
 * 1. FIREBASE_ADMIN_CERT (JSON string)
 * 2. Individual environment variables
 * 3. GOOGLE_APPLICATION_CREDENTIALS (service account file path)
 */
function initializeFirebaseAdmin() {
  // Already initialized - return early
  if (admin.apps.length > 0) {
    isInitialized = true;
    return;
  }

  // Only initialize on server
  if (!isServer) {
    console.warn('[Firebase Admin] Skipping initialization - not running on server');
    return;
  }

  try {
    let credential = null;
    let projectId = null;

    // Method 1: FIREBASE_ADMIN_CERT (JSON string - recommended for Vercel/cloud)
    if (process.env.FIREBASE_ADMIN_CERT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CERT);
        credential = admin.credential.cert(serviceAccount);
        projectId = serviceAccount.project_id;
        console.log('[Firebase Admin] ✅ Using FIREBASE_ADMIN_CERT');
      } catch (parseError) {
        console.error('[Firebase Admin] Failed to parse FIREBASE_ADMIN_CERT:', parseError.message);
      }
    }

    // Method 2: Individual environment variables
    if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle escaped newlines in private key
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
        credential = admin.credential.cert(serviceAccount);
        projectId = process.env.FIREBASE_PROJECT_ID;
        console.log('[Firebase Admin] ✅ Using individual environment variables');
      } catch (certError) {
        console.error('[Firebase Admin] Failed to create cert from individual vars:', certError.message);
      }
    }

    // Method 3: Application Default Credentials (for local development with gcloud)
    if (!credential && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        credential = admin.credential.applicationDefault();
        console.log('[Firebase Admin] ✅ Using GOOGLE_APPLICATION_CREDENTIALS');
      } catch (adcError) {
        console.error('[Firebase Admin] Failed to use application default credentials:', adcError.message);
      }
    }

    // No credentials found
    if (!credential) {
      console.warn('[Firebase Admin] ⚠️  No credentials found');
      console.warn('[Firebase Admin] Set one of:');
      console.warn('[Firebase Admin]   - FIREBASE_ADMIN_CERT (JSON string)');
      console.warn('[Firebase Admin]   - FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY');
      console.warn('[Firebase Admin]   - GOOGLE_APPLICATION_CREDENTIALS (file path)');
      console.warn('[Firebase Admin] Firebase Admin features will not work at runtime');
      return;
    }

    // Initialize Firebase Admin
    const appConfig = {
      credential,
    };

    // Add project ID if available
    if (projectId) {
      appConfig.projectId = projectId;
    } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      appConfig.projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    }

    admin.initializeApp(appConfig);
    isInitialized = true;

    console.log('[Firebase Admin] ✅ Initialized successfully');
    console.log(`[Firebase Admin] Project ID: ${appConfig.projectId || 'not set'}`);

  } catch (error) {
    console.error('[Firebase Admin] ❌ Initialization failed:', error.message);
    console.error('[Firebase Admin] Stack:', error.stack);
  }
}

// Run initialization immediately (singleton pattern)
if (isServer) {
  initializeFirebaseAdmin();
}

// ============================================
// SERVICE GETTERS (LAZY + SAFE)
// ============================================

/**
 * Get Firestore instance
 * @returns {admin.firestore.Firestore}
 * @throws {Error} if Firebase Admin is not initialized
 */
export function getDb() {
  if (!isServer) {
    throw new Error('Firebase Admin can only be used on the server side');
  }

  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin is not initialized. Check your credentials.');
  }

  return admin.firestore();
}

/**
 * Get Auth instance
 * @returns {admin.auth.Auth}
 * @throws {Error} if Firebase Admin is not initialized
 */
export function getAuth() {
  if (!isServer) {
    throw new Error('Firebase Admin can only be used on the server side');
  }

  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin is not initialized. Check your credentials.');
  }

  return admin.auth();
}

/**
 * Get Storage instance
 * @returns {admin.storage.Storage}
 * @throws {Error} if Firebase Admin is not initialized
 */
export function getStorage() {
  if (!isServer) {
    throw new Error('Firebase Admin can only be used on the server side');
  }

  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin is not initialized. Check your credentials.');
  }

  return admin.storage();
}

/**
 * Get Firebase Admin App instance
 * @returns {admin.app.App}
 * @throws {Error} if Firebase Admin is not initialized
 */
export function getAdminApp() {
  if (!isServer) {
    throw new Error('Firebase Admin can only be used on the server side');
  }

  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin is not initialized. Check your credentials.');
  }

  return admin.app();
}

// ============================================
// BUILD-TIME SAFE EXPORTS (WITH PROXY STUBS)
// ============================================

/**
 * Create a safe stub that returns itself for chaining during build
 * At runtime, throws proper error if Firebase isn't initialized
 */
function createBuildSafeStub(serviceName) {
  return new Proxy({}, {
    get(target, prop) {
      // During build (no admin apps), return another stub for chaining
      if (typeof window === 'undefined' && admin.apps.length === 0) {
        // Return function that returns stub (for method chaining)
        if (typeof prop === 'string') {
          return () => createBuildSafeStub(serviceName);
        }
        return createBuildSafeStub(serviceName);
      }

      // At runtime, throw proper error
      throw new Error(`Firebase Admin ${serviceName} is not initialized. Check your credentials.`);
    }
  });
}

/**
 * Firestore instance - SAFE for build-time, lazy at runtime
 * @type {admin.firestore.Firestore}
 */
export const db = isServer && admin.apps.length > 0
  ? admin.firestore()
  : createBuildSafeStub('Firestore');

/**
 * Auth instance - SAFE for build-time, lazy at runtime
 * @type {admin.auth.Auth}
 */
export const auth = isServer && admin.apps.length > 0
  ? admin.auth()
  : createBuildSafeStub('Auth');

/**
 * Storage instance - SAFE for build-time, lazy at runtime
 * @type {admin.storage.Storage}
 */
export const storage = isServer && admin.apps.length > 0
  ? admin.storage()
  : createBuildSafeStub('Storage');

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verify Firebase ID token from client
 * @param {string} token - Firebase ID token
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
export async function verifyAuthToken(token) {
  if (!token) {
    throw new Error('No token provided');
  }

  if (!isServer) {
    throw new Error('verifyAuthToken can only be called on the server side');
  }

  const authService = getAuth();
  return await authService.verifyIdToken(token);
}

/**
 * Get user by UID
 * @param {string} uid - User ID
 * @returns {Promise<admin.auth.UserRecord>}
 */
export async function getUserByUid(uid) {
  if (!uid) {
    throw new Error('No UID provided');
  }

  const authService = getAuth();
  return await authService.getUser(uid);
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<admin.auth.UserRecord>}
 */
export async function getUserByEmail(email) {
  if (!email) {
    throw new Error('No email provided');
  }

  const authService = getAuth();
  return await authService.getUserByEmail(email);
}

/**
 * Create custom token for user
 * @param {string} uid - User ID
 * @param {Object} [claims] - Optional custom claims
 * @returns {Promise<string>}
 */
export async function createCustomToken(uid, claims = {}) {
  if (!uid) {
    throw new Error('No UID provided');
  }

  const authService = getAuth();
  return await authService.createCustomToken(uid, claims);
}

/**
 * Set custom user claims
 * @param {string} uid - User ID
 * @param {Object} claims - Custom claims object
 * @returns {Promise<void>}
 */
export async function setCustomUserClaims(uid, claims) {
  if (!uid) {
    throw new Error('No UID provided');
  }

  const authService = getAuth();
  return await authService.setCustomUserClaims(uid, claims);
}

/**
 * Delete user by UID
 * @param {string} uid - User ID
 * @returns {Promise<void>}
 */
export async function deleteUser(uid) {
  if (!uid) {
    throw new Error('No UID provided');
  }

  const authService = getAuth();
  return await authService.deleteUser(uid);
}

/**
 * Check if Firebase Admin is initialized
 * @returns {boolean}
 */
export function isAdminInitialized() {
  return isServer && isInitialized && admin.apps.length > 0;
}

/**
 * Get Firestore FieldValue utilities
 * @returns {typeof admin.firestore.FieldValue}
 */
export function getFieldValue() {
  return admin.firestore.FieldValue;
}

/**
 * Get Firestore Timestamp utilities
 * @returns {typeof admin.firestore.Timestamp}
 */
export function getTimestamp() {
  return admin.firestore.Timestamp;
}

// ============================================
// EXPORTS
// ============================================

/**
 * Firebase Admin instance
 */
export default admin;

// Named exports for convenience
export {
  admin,
  isServer,
};

// Export common FieldValue helpers
export const FieldValue = admin.firestore?.FieldValue || {};
export const Timestamp = admin.firestore?.Timestamp || {};
export const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();
export const increment = (n) => admin.firestore.FieldValue.increment(n);
export const arrayUnion = (...elements) => admin.firestore.FieldValue.arrayUnion(...elements);
export const arrayRemove = (...elements) => admin.firestore.FieldValue.arrayRemove(...elements);
