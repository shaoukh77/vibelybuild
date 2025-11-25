/**
 * Save Build to Firestore
 *
 * Saves build data to the user_builds collection
 */

import { collection, addDoc, doc, setDoc, deleteDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface BuildData {
  projectId: string;
  userId: string;
  prompt: string;
  target: string;
  blueprint?: any;
  status: 'queued' | 'running' | 'complete' | 'failed';
  error?: string | null;
  downloadUrl?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Save a new build to Firestore
 */
export async function saveBuildToFirestore(buildData: BuildData): Promise<string> {
  try {
    const buildsRef = collection(db, 'user_builds');
    const docRef = await addDoc(buildsRef, {
      ...buildData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`[Firestore] ✅ Build saved: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] ❌ Failed to save build:', error);
    throw error;
  }
}

/**
 * Update an existing build in Firestore
 */
export async function updateBuildInFirestore(
  projectId: string,
  userId: string,
  updates: Partial<BuildData>
): Promise<void> {
  try {
    // Find the build document
    const buildsRef = collection(db, 'user_builds');
    const q = query(
      buildsRef,
      where('projectId', '==', projectId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn(`[Firestore] Build not found: ${projectId}`);
      return;
    }

    const buildDoc = snapshot.docs[0];
    await setDoc(
      doc(db, 'user_builds', buildDoc.id),
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`[Firestore] ✅ Build updated: ${projectId}`);
  } catch (error) {
    console.error('[Firestore] ❌ Failed to update build:', error);
    throw error;
  }
}

/**
 * Delete a build from Firestore
 */
export async function deleteBuildFromFirestore(
  projectId: string,
  userId: string
): Promise<void> {
  try {
    // Find the build document
    const buildsRef = collection(db, 'user_builds');
    const q = query(
      buildsRef,
      where('projectId', '==', projectId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Build not found');
    }

    const buildDoc = snapshot.docs[0];
    await deleteDoc(doc(db, 'user_builds', buildDoc.id));

    console.log(`[Firestore] ✅ Build deleted: ${projectId}`);
  } catch (error) {
    console.error('[Firestore] ❌ Failed to delete build:', error);
    throw error;
  }
}

/**
 * Get all builds for a user from Firestore
 */
export async function getUserBuildsFromFirestore(userId: string): Promise<BuildData[]> {
  try {
    const buildsRef = collection(db, 'user_builds');
    const q = query(buildsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const builds = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    console.log(`[Firestore] ✅ Retrieved ${builds.length} builds for user ${userId}`);
    return builds;
  } catch (error) {
    console.error('[Firestore] ❌ Failed to get builds:', error);
    return [];
  }
}
