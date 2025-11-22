/**
 * Get Apps from Store - Firestore Helper
 * Fetch all published apps from the VibelyBuild Store
 */

import { collection, getDocs, query, orderBy, where, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface StoreApp {
  appId: string;
  userId: string;
  jobId: string;
  appName: string;
  description: string;
  previewUrl: string;
  screenshotUrl: string;
  bundleUrl: string;
  bundleSize: number;
  storeUrl: string;
  publishedAt: any;
  views: number;
  likes: number;
  status: 'published' | 'draft' | 'unlisted';
  target?: string; // 'web' | 'ios' | 'android' | 'multi'
}

export interface GetAppsOptions {
  limit?: number;
  orderByField?: 'publishedAt' | 'views' | 'likes';
  orderDirection?: 'desc' | 'asc';
  status?: 'published' | 'draft' | 'unlisted';
  target?: string;
}

/**
 * Get all published apps from the Store
 */
export async function getAppsFromStore(options: GetAppsOptions = {}): Promise<StoreApp[]> {
  try {
    const {
      limit = 50,
      orderByField = 'publishedAt',
      orderDirection = 'desc',
      status = 'published',
      target,
    } = options;

    console.log('[Store] 📦 Fetching apps from Firestore...');
    console.log('[Store] Options:', { limit, orderByField, orderDirection, status, target });

    // Build query
    const storeRef = collection(db, 'store', 'apps');
    let q = query(
      storeRef,
      where('status', '==', status),
      orderBy(orderByField, orderDirection),
      firestoreLimit(limit)
    );

    // Add target filter if specified
    if (target) {
      q = query(
        storeRef,
        where('status', '==', status),
        where('target', '==', target),
        orderBy(orderByField, orderDirection),
        firestoreLimit(limit)
      );
    }

    const snapshot = await getDocs(q);

    const apps: StoreApp[] = snapshot.docs.map(doc => ({
      appId: doc.id,
      ...doc.data(),
    })) as StoreApp[];

    console.log(`[Store] ✅ Fetched ${apps.length} apps`);

    return apps;

  } catch (error: any) {
    console.error('[Store] ❌ Failed to fetch apps:', error);

    // Fallback: Try without composite query if index doesn't exist
    if (error.code === 'failed-precondition' || error.message.includes('index')) {
      console.log('[Store] ⚠️  Composite index not found, using simple query...');

      try {
        const storeRef = collection(db, 'store', 'apps');
        const q = query(
          storeRef,
          where('status', '==', 'published'),
          firestoreLimit(options.limit || 50)
        );

        const snapshot = await getDocs(q);
        const apps: StoreApp[] = snapshot.docs.map(doc => ({
          appId: doc.id,
          ...doc.data(),
        })) as StoreApp[];

        console.log(`[Store] ✅ Fetched ${apps.length} apps (simple query)`);
        return apps;

      } catch (fallbackError) {
        console.error('[Store] ❌ Fallback query also failed:', fallbackError);
        return [];
      }
    }

    return [];
  }
}

/**
 * Get apps published by a specific user
 */
export async function getUserPublishedApps(userId: string): Promise<StoreApp[]> {
  try {
    console.log(`[Store] 📦 Fetching apps for user ${userId}...`);

    const userAppsRef = collection(db, 'users', userId, 'published_apps');
    const q = query(userAppsRef, orderBy('publishedAt', 'desc'));

    const snapshot = await getDocs(q);

    const apps: StoreApp[] = snapshot.docs.map(doc => ({
      appId: doc.id,
      ...doc.data(),
    })) as StoreApp[];

    console.log(`[Store] ✅ Fetched ${apps.length} apps for user`);

    return apps;

  } catch (error: any) {
    console.error('[Store] ❌ Failed to fetch user apps:', error);
    return [];
  }
}

/**
 * Search apps by name or description
 */
export function searchApps(apps: StoreApp[], searchTerm: string): StoreApp[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return apps;
  }

  const term = searchTerm.toLowerCase();

  return apps.filter(app =>
    app.appName.toLowerCase().includes(term) ||
    app.description.toLowerCase().includes(term)
  );
}

/**
 * Filter apps by target platform
 */
export function filterAppsByTarget(apps: StoreApp[], target: string | null): StoreApp[] {
  if (!target || target === 'all') {
    return apps;
  }

  return apps.filter(app => app.target === target);
}

/**
 * Sort apps by field
 */
export function sortApps(
  apps: StoreApp[],
  field: 'publishedAt' | 'views' | 'likes' | 'appName',
  direction: 'asc' | 'desc' = 'desc'
): StoreApp[] {
  return [...apps].sort((a, b) => {
    let aValue: any = a[field];
    let bValue: any = b[field];

    // Handle Firestore Timestamps
    if (field === 'publishedAt') {
      aValue = aValue?.toMillis?.() || 0;
      bValue = bValue?.toMillis?.() || 0;
    }

    // Handle string sorting (appName)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'desc'
        ? bValue.localeCompare(aValue)
        : aValue.localeCompare(bValue);
    }

    // Handle number sorting
    return direction === 'desc' ? bValue - aValue : aValue - bValue;
  });
}
