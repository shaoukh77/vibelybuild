/**
 * Firebase Admin SDK - Simple Lazy-Load Pattern
 * Server-side only - bypasses Firestore security rules
 * Optimized for Render.com deployment
 */

import admin from 'firebase-admin';

// Lazy initialization - only initialize once when first accessed
if (!admin.apps.length) {
  try {
    let credential;

    // Method 1: FIREBASE_ADMIN_CERT (JSON string - single env var)
    if (process.env.FIREBASE_ADMIN_CERT) {
      console.log('[Firebase Admin] Using FIREBASE_ADMIN_CERT');
      credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CERT));
    }
    // Method 2: Individual environment variables
    else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      console.log('[Firebase Admin] Using individual environment variables');
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    }
    // Method 3: Application Default Credentials (for local development with gcloud)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('[Firebase Admin] Using GOOGLE_APPLICATION_CREDENTIALS');
      credential = admin.credential.applicationDefault();
    }
    // No credentials found - log warning but don't crash (for build time)
    else {
      console.warn('[Firebase Admin] ⚠️  No credentials found');
      console.warn('[Firebase Admin] Skipping initialization - will fail at runtime if Firebase is accessed');
    }

    // Initialize app if credentials were found
    if (credential) {
      admin.initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });

      console.log('[Firebase Admin] ✅ Initialized successfully');
    }
  } catch (error) {
    console.error('[Firebase Admin] ❌ Initialization failed:', error.message);
    console.warn('[Firebase Admin] Continuing without Firebase - runtime errors will occur if Firebase is accessed');
  }
}

// Export the admin instance directly
export default admin;

// Function to get initialized admin instance
export function getAdminApp() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not initialized. Check your environment variables.');
  }
  return admin;
}

// Lazy-loaded service getters (use these for runtime access)
export function getDb() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not initialized');
  }
  return admin.firestore();
}

export function getAuth() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not initialized');
  }
  return admin.auth();
}

export function getStorage() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not initialized');
  }
  return admin.storage();
}

// Create stub objects for build-time to prevent errors
// At runtime (when Firebase is initialized), these will work properly
const createStub = (name) => new Proxy({}, {
  get() {
    if (typeof window === 'undefined' && !admin.apps.length) {
      // Build time - return another stub
      return createStub(name);
    }
    throw new Error(`Firebase Admin ${name} not initialized`);
  }
});

/**
 * @type {admin.firestore.Firestore}
 */
export const db = admin.apps.length ? admin.firestore() : createStub('Firestore');

/**
 * @type {admin.auth.Auth}
 */
export const auth = admin.apps.length ? admin.auth() : createStub('Auth');

/**
 * @type {admin.storage.Storage}
 */
export const storage = admin.apps.length ? admin.storage() : createStub('Storage');

// Utility function for verifying auth tokens
export async function verifyAuthToken(token) {
  if (!token) {
    throw new Error('No token provided');
  }
  return await getAuth().verifyIdToken(token);
}
