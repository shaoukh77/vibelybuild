/**
 * @deprecated This file is DEPRECATED and should NOT be used.
 *
 * REASON: This file uses incorrect Firestore paths that don't match the security rules:
 * - Uses: /users/{uid}/builds/{buildId} ❌
 * - Should use: /builds/{buildId} ✓
 *
 * MIGRATION:
 * - Use functions from './firestore.js' instead
 * - Build logs are now stored in /buildLogs/{logId} collection
 * - User apps are in /users/{uid}/apps/{appId} ✓
 *
 * This file will be removed in a future update.
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  setDoc,
  query,
  orderBy,
  limit,
  getDocs,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { db, auth } from "./firebase";

console.warn('⚠️  db.js is DEPRECATED. Use firestore.js instead. See file header for migration details.');

// Helper to get current user
const getCurrentUser = () => {
  return auth.currentUser;
};

// Save a new build
export async function saveBuild({ uid, prompt }) {
  if (!uid) {
    console.warn("saveBuild: no uid provided");
    return null;
  }

  try {
    const buildRef = await addDoc(collection(db, "users", uid, "builds"), {
      prompt,
      status: "queued",
      logs: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      public: false,
      title: ""
    });

    return buildRef.id;
  } catch (error) {
    console.error("Error saving build:", error);
    return null;
  }
}

// Append a log line to a build
export async function appendLog({ uid, buildId, line }) {
  if (!uid || !buildId) {
    console.warn("appendLog: missing uid or buildId");
    return;
  }

  try {
    const buildRef = doc(db, "users", uid, "builds", buildId);
    await updateDoc(buildRef, {
      logs: arrayUnion(line),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error appending log:", error);
  }
}

// Complete a build
export async function completeBuild({ uid, buildId, success }) {
  if (!uid || !buildId) {
    console.warn("completeBuild: missing uid or buildId");
    return;
  }

  try {
    const buildRef = doc(db, "users", uid, "builds", buildId);
    await updateDoc(buildRef, {
      status: success ? "done" : "error",
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error completing build:", error);
  }
}

// Publish a build to the public store
export async function publishBuild({ uid, buildId, title }) {
  if (!uid || !buildId) {
    console.warn("publishBuild: missing uid or buildId");
    return null;
  }

  try {
    // Get the build data
    const buildRef = doc(db, "users", uid, "builds", buildId);
    const buildSnap = await getDoc(buildRef);

    if (!buildSnap.exists()) {
      console.error("Build not found");
      return null;
    }

    const buildData = buildSnap.data();

    // Create a public app document
    const publicAppRef = doc(collection(db, "publicApps"));
    await setDoc(publicAppRef, {
      title: title || buildData.title || buildData.prompt.substring(0, 50),
      prompt: buildData.prompt,
      ownerUid: uid,
      createdAt: serverTimestamp(),
      coverUrl: ""
    });

    // Mark the build as public
    await updateDoc(buildRef, {
      public: true,
      title: title || buildData.title || buildData.prompt.substring(0, 50),
      updatedAt: serverTimestamp()
    });

    return publicAppRef.id;
  } catch (error) {
    console.error("Error publishing build:", error);
    return null;
  }
}

// Get user's builds (for real-time updates)
export function subscribeToUserBuilds(uid, callback, limitCount = 10) {
  if (!uid) {
    console.warn("subscribeToUserBuilds: no uid provided");
    return () => {};
  }

  const buildsRef = collection(db, "users", uid, "builds");
  const q = query(buildsRef, orderBy("createdAt", "desc"), limit(limitCount));

  return onSnapshot(q, (snapshot) => {
    const builds = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(builds);
  }, (error) => {
    console.error("Error subscribing to builds:", error);
    callback([]);
  });
}

// Get public apps
export async function getPublicApps(limitCount = 20) {
  try {
    const appsRef = collection(db, "publicApps");
    const q = query(appsRef, orderBy("createdAt", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting public apps:", error);
    return [];
  }
}

// Subscribe to public apps (real-time)
export function subscribeToPublicApps(callback, limitCount = 20) {
  const appsRef = collection(db, "publicApps");
  const q = query(appsRef, orderBy("createdAt", "desc"), limit(limitCount));

  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(apps);
  }, (error) => {
    console.error("Error subscribing to public apps:", error);
    callback([]);
  });
}

// Get build count for a user
export async function getUserBuildCount(uid) {
  if (!uid) return 0;

  try {
    const buildsRef = collection(db, "users", uid, "builds");
    const snapshot = await getDocs(buildsRef);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting build count:", error);
    return 0;
  }
}
