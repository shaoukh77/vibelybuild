/**
 * Firebase Admin SDK - Production-Ready Singleton
 * Server-side only - bypasses Firestore security rules
 * Supports multiple initialization methods for Render.com deployment
 */

import admin from 'firebase-admin';

let app;
let db;
let auth;

/**
 * Initialize Firebase Admin SDK
 * Supports 3 methods:
 * 1. GOOGLE_APPLICATION_CREDENTIALS (file path)
 * 2. FIREBASE_SERVICE_ACCOUNT_KEY (JSON string)
 * 3. Individual env vars (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 */
function initializeFirebaseAdmin() {
  if (app) {
    return { app, db, auth };
  }

  try {
    let credential;

    // Method 1: GOOGLE_APPLICATION_CREDENTIALS (file path)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('[Firebase Admin] Using GOOGLE_APPLICATION_CREDENTIALS');
      credential = admin.credential.applicationDefault();
    }
    // Method 2: FIREBASE_SERVICE_ACCOUNT_KEY (JSON string)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('[Firebase Admin] Using FIREBASE_SERVICE_ACCOUNT_KEY');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = admin.credential.cert(serviceAccount);
    }
    // Method 3: Individual environment variables
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
    // Fallback: Application Default Credentials (Cloud environments)
    else {
      console.log('[Firebase Admin] Using application default credentials');
      credential = admin.credential.applicationDefault();
    }

    // Initialize app
    app = admin.initializeApp({
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    // Initialize services
    db = admin.firestore();
    auth = admin.auth();

    // Firestore settings for better performance
    db.settings({
      ignoreUndefinedProperties: true,
    });

    console.log('[Firebase Admin] ✅ Initialized successfully');
    return { app, db, auth };

  } catch (error) {
    console.error('[Firebase Admin] ❌ Initialization failed:', error.message);
    throw new Error(`Firebase Admin initialization failed: ${error.message}`);
  }
}

// Lazy initialization state
let initialized = false;
let _adminApp, _adminDb, _adminAuth;

// Lazy initialization helper
function ensureInitialized() {
  if (!initialized) {
    const result = initializeFirebaseAdmin();
    _adminApp = result.app;
    _adminDb = result.db;
    _adminAuth = result.auth;
    initialized = true;
  }
}

// Export lazy proxies that initialize on first access
export const adminApp = new Proxy({}, {
  get: (target, prop) => {
    ensureInitialized();
    return _adminApp[prop];
  },
  apply: (target, thisArg, args) => {
    ensureInitialized();
    return _adminApp.apply(thisArg, args);
  }
});

export const adminDb = new Proxy({}, {
  get: (target, prop) => {
    ensureInitialized();
    return _adminDb[prop];
  }
});

export const adminAuth = new Proxy({}, {
  get: (target, prop) => {
    ensureInitialized();
    return _adminAuth[prop];
  }
});

export default admin;
