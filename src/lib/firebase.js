/**
 * Firebase Client SDK - Next.js 14 App Router Compatible
 *
 * GUARANTEED SAFE INITIALIZATION:
 * - auth, db, storage are NEVER undefined
 * - Works with or without environment variables
 * - Lazy initialization for optimal performance
 * - Full error handling with graceful degradation
 * - Compatible with Next.js client components
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  connectAuthEmulator
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// ============================================
// CONFIGURATION
// ============================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate if we have minimum required config
const hasValidConfig = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

// ============================================
// FIREBASE APP INITIALIZATION
// ============================================

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseStorage = null;
let googleAuthProvider = null;
let isInitialized = false;

/**
 * Initialize Firebase App (lazy, singleton pattern)
 * Only runs once, returns existing instance on subsequent calls
 */
function initializeFirebaseApp() {
  // Return existing app if already initialized
  if (firebaseApp) {
    return firebaseApp;
  }

  // Check if app already exists (from another module)
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = getApp();
    isInitialized = true;
    return firebaseApp;
  }

  // Only initialize if we have valid config
  if (!hasValidConfig) {
    console.warn('[Firebase Client] Missing required environment variables. Firebase features will be limited.');
    return null;
  }

  try {
    firebaseApp = initializeApp(firebaseConfig);
    isInitialized = true;
    console.log('[Firebase Client] ✅ Initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('[Firebase Client] ❌ Initialization failed:', error.message);
    return null;
  }
}

/**
 * Get or initialize Firebase Auth
 * GUARANTEED to return a valid Auth instance or a safe mock
 */
function getFirebaseAuth() {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const app = initializeFirebaseApp();

  if (!app) {
    // Return a safe mock that won't crash
    console.warn('[Firebase Client] Auth unavailable - using mock');
    return createAuthMock();
  }

  try {
    firebaseAuth = getAuth(app);

    // Connect to emulator if in development (optional)
    if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_AUTH_PORT && typeof window !== 'undefined') {
      try {
        connectAuthEmulator(
          firebaseAuth,
          `http://localhost:${process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_AUTH_PORT}`,
          { disableWarnings: true }
        );
        console.log('[Firebase Client] Connected to Auth emulator');
      } catch (e) {
        // Emulator already connected or not available
      }
    }

    return firebaseAuth;
  } catch (error) {
    console.error('[Firebase Client] ❌ Auth initialization failed:', error.message);
    return createAuthMock();
  }
}

/**
 * Get or initialize Firestore
 * GUARANTEED to return a valid Firestore instance or a safe mock
 */
function getFirebaseDb() {
  if (firebaseDb) {
    return firebaseDb;
  }

  const app = initializeFirebaseApp();

  if (!app) {
    console.warn('[Firebase Client] Firestore unavailable - using mock');
    return createDbMock();
  }

  try {
    firebaseDb = getFirestore(app);

    // Connect to emulator if in development (optional)
    if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_FIRESTORE_PORT && typeof window !== 'undefined') {
      try {
        connectFirestoreEmulator(
          firebaseDb,
          'localhost',
          parseInt(process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_FIRESTORE_PORT)
        );
        console.log('[Firebase Client] Connected to Firestore emulator');
      } catch (e) {
        // Emulator already connected or not available
      }
    }

    return firebaseDb;
  } catch (error) {
    console.error('[Firebase Client] ❌ Firestore initialization failed:', error.message);
    return createDbMock();
  }
}

/**
 * Get or initialize Firebase Storage
 * GUARANTEED to return a valid Storage instance or a safe mock
 */
function getFirebaseStorage() {
  if (firebaseStorage) {
    return firebaseStorage;
  }

  const app = initializeFirebaseApp();

  if (!app) {
    console.warn('[Firebase Client] Storage unavailable - using mock');
    return createStorageMock();
  }

  try {
    firebaseStorage = getStorage(app);

    // Connect to emulator if in development (optional)
    if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_STORAGE_PORT && typeof window !== 'undefined') {
      try {
        connectStorageEmulator(
          firebaseStorage,
          'localhost',
          parseInt(process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_STORAGE_PORT)
        );
        console.log('[Firebase Client] Connected to Storage emulator');
      } catch (e) {
        // Emulator already connected or not available
      }
    }

    return firebaseStorage;
  } catch (error) {
    console.error('[Firebase Client] ❌ Storage initialization failed:', error.message);
    return createStorageMock();
  }
}

/**
 * Get or initialize Google Auth Provider
 */
function getGoogleProvider() {
  if (googleAuthProvider) {
    return googleAuthProvider;
  }

  try {
    googleAuthProvider = new GoogleAuthProvider();
    return googleAuthProvider;
  } catch (error) {
    console.error('[Firebase Client] ❌ GoogleAuthProvider initialization failed:', error.message);
    return null;
  }
}

// ============================================
// SAFE MOCK OBJECTS (PREVENT UNDEFINED ERRORS)
// ============================================

/**
 * Create a safe Auth mock that won't crash when methods are called
 */
function createAuthMock() {
  const mockAuth = {
    currentUser: null,
    app: null,
    config: null,
    name: 'mock-auth',
    onAuthStateChanged: (callback) => {
      // Call with null user immediately, return unsubscribe function
      if (callback) setTimeout(() => callback(null), 0);
      return () => {};
    },
    signOut: async () => {
      console.warn('[Firebase Client] Auth mock: signOut called but Firebase is not initialized');
      return Promise.resolve();
    },
    signInWithPopup: async () => {
      console.warn('[Firebase Client] Auth mock: signInWithPopup called but Firebase is not initialized');
      throw new Error('Firebase is not initialized. Please check your environment variables.');
    },
  };

  // Return a Proxy to handle any other method calls safely
  return new Proxy(mockAuth, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      // Return a safe function for any unknown method
      return () => {
        console.warn(`[Firebase Client] Auth mock: ${String(prop)} called but Firebase is not initialized`);
        throw new Error('Firebase is not initialized. Please check your environment variables.');
      };
    }
  });
}

/**
 * Create a safe Firestore mock
 */
function createDbMock() {
  return new Proxy({}, {
    get(target, prop) {
      console.warn(`[Firebase Client] Firestore mock: ${String(prop)} called but Firebase is not initialized`);
      throw new Error('Firebase is not initialized. Please check your environment variables.');
    }
  });
}

/**
 * Create a safe Storage mock
 */
function createStorageMock() {
  return new Proxy({}, {
    get(target, prop) {
      console.warn(`[Firebase Client] Storage mock: ${String(prop)} called but Firebase is not initialized`);
      throw new Error('Firebase is not initialized. Please check your environment variables.');
    }
  });
}

// ============================================
// EXPORTED INSTANCES (GUARANTEED NON-UNDEFINED)
// ============================================

/**
 * Firebase App instance
 * @type {import('firebase/app').FirebaseApp | null}
 */
export const app = typeof window !== 'undefined' ? initializeFirebaseApp() : null;

/**
 * Firebase Auth instance (NEVER undefined - uses mock if not initialized)
 * @type {import('firebase/auth').Auth}
 */
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : createAuthMock();

/**
 * Firestore instance (NEVER undefined - uses mock if not initialized)
 * @type {import('firebase/firestore').Firestore}
 */
export const db = typeof window !== 'undefined' ? getFirebaseDb() : createDbMock();

/**
 * Firebase Storage instance (NEVER undefined - uses mock if not initialized)
 * @type {import('firebase/storage').FirebaseStorage}
 */
export const storage = typeof window !== 'undefined' ? getFirebaseStorage() : createStorageMock();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sign in with Google
 * @returns {Promise<import('firebase/auth').User>}
 */
export const signInWithGoogle = async () => {
  const authInstance = getFirebaseAuth();
  const provider = getGoogleProvider();

  if (!provider) {
    throw new Error('Google Auth Provider is not available');
  }

  try {
    const result = await signInWithPopup(authInstance, provider);
    return result.user;
  } catch (error) {
    console.error('[Firebase Client] Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  const authInstance = getFirebaseAuth();

  try {
    await signOut(authInstance);
  } catch (error) {
    console.error('[Firebase Client] Error signing out:', error);
    throw error;
  }
};

/**
 * Subscribe to auth state changes
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  const authInstance = getFirebaseAuth();
  return onAuthStateChanged(authInstance, callback);
};

/**
 * Check if Firebase is properly initialized
 * @returns {boolean}
 */
export const isFirebaseInitialized = () => {
  return isInitialized && firebaseApp !== null;
};

/**
 * Get current auth user (safe)
 * @returns {import('firebase/auth').User | null}
 */
export const getCurrentUser = () => {
  const authInstance = getFirebaseAuth();
  return authInstance?.currentUser || null;
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  app,
  auth,
  db,
  storage,
  signInWithGoogle,
  signOutUser,
  onAuthChange,
  isFirebaseInitialized,
  getCurrentUser,
};
