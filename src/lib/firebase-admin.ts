import * as admin from "firebase-admin";

/**
 * Firebase Admin SDK initialization for server-side operations
 * This bypasses Firestore security rules and is meant for trusted server environments only
 *
 * PRODUCTION-READY:
 * - Supports GOOGLE_APPLICATION_CREDENTIALS env var
 * - Supports FIREBASE_SERVICE_ACCOUNT_KEY JSON string
 * - Works on Render.com, Vercel, Cloud Run
 * - Singleton pattern prevents multiple initializations
 */

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  try {
    let credential;

    // Priority 1: GOOGLE_APPLICATION_CREDENTIALS (file path)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log("[Firebase Admin] Using GOOGLE_APPLICATION_CREDENTIALS");
      credential = admin.credential.applicationDefault();
    }
    // Priority 2: FIREBASE_SERVICE_ACCOUNT_KEY (JSON string)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log("[Firebase Admin] Using FIREBASE_SERVICE_ACCOUNT_KEY");
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = admin.credential.cert(serviceAccount);
    }
    // Priority 3: Application Default Credentials (Cloud environments)
    else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.log("[Firebase Admin] Using application default credentials");
      credential = admin.credential.applicationDefault();
    }

    // Initialize with credential
    admin.initializeApp({
      credential,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
    });

    console.log("[Firebase Admin] ✅ Successfully initialized");

  } catch (error: any) {
    console.error("[Firebase Admin] ❌ Initialization error:", error.message);

    // Try fallback initialization
    try {
      admin.initializeApp();
      console.log("[Firebase Admin] ⚠️ Initialized with fallback (auto-detect)");
    } catch (fallbackError: any) {
      console.error("[Firebase Admin] ❌ Fallback initialization failed:", fallbackError.message);
      throw new Error(`Firebase Admin initialization failed: ${error.message}`);
    }
  }
}

// Export singletons
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
