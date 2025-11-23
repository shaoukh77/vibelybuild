/**
 * Get App Details from Store - Firestore Helper
 * Fetch individual app details by appId
 */

import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StoreApp } from '@/lib/store/getApps';

export interface AppDetails extends StoreApp {
  // Extended details (can add more fields as needed)
}

/**
 * Get app details by appId
 */
export async function getAppDetails(appId: string): Promise<AppDetails | null> {
  try {
    console.log(`[Store] 📱 Fetching app details for ${appId}...`);

    const appRef = doc(db, 'store', 'apps', appId);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      console.log(`[Store] ⚠️  App not found: ${appId}`);
      return null;
    }

    const appData = {
      appId: appSnap.id,
      ...appSnap.data(),
    } as AppDetails;

    console.log(`[Store] ✅ Fetched app: ${appData.appName}`);

    return appData;

  } catch (error: any) {
    console.error(`[Store] ❌ Failed to fetch app details:`, error);
    return null;
  }
}

/**
 * Increment view count for an app
 */
export async function incrementAppViews(appId: string): Promise<boolean> {
  try {
    console.log(`[Store] 👁️  Incrementing views for ${appId}...`);

    const appRef = doc(db, 'store', 'apps', appId);

    await setDoc(
      appRef,
      {
        views: increment(1),
      },
      { merge: true }
    );

    console.log(`[Store] ✅ Views incremented`);

    return true;

  } catch (error: any) {
    console.error(`[Store] ❌ Failed to increment views:`, error);
    return false;
  }
}

/**
 * Increment like count for an app
 */
export async function incrementAppLikes(appId: string): Promise<boolean> {
  try {
    console.log(`[Store] ❤️  Incrementing likes for ${appId}...`);

    const appRef = doc(db, 'store', 'apps', appId);

    await setDoc(
      appRef,
      {
        likes: increment(1),
      },
      { merge: true }
    );

    console.log(`[Store] ✅ Likes incremented`);

    return true;

  } catch (error: any) {
    console.error(`[Store] ❌ Failed to increment likes:`, error);
    return false;
  }
}

/**
 * Check if user has liked an app (stored in localStorage)
 */
export function hasUserLikedApp(appId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const likedApps = JSON.parse(localStorage.getItem('likedApps') || '[]');
    return likedApps.includes(appId);
  } catch {
    return false;
  }
}

/**
 * Mark app as liked by user (in localStorage)
 */
export function markAppAsLiked(appId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const likedApps = JSON.parse(localStorage.getItem('likedApps') || '[]');

    if (!likedApps.includes(appId)) {
      likedApps.push(appId);
      localStorage.setItem('likedApps', JSON.stringify(likedApps));
    }
  } catch (error) {
    console.error('[Store] Failed to save liked app:', error);
  }
}

/**
 * Format published date for display
 */
export function formatPublishedDate(publishedAt: any): string {
  if (!publishedAt) return 'Unknown';

  try {
    const date = publishedAt.toDate ? publishedAt.toDate() : new Date(publishedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });

  } catch {
    return 'Unknown';
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get author name from userId (placeholder - can be enhanced with user lookup)
 */
export function getAuthorName(userId: string): string {
  // For now, return a truncated userId
  // In production, fetch user profile from Firestore
  return `User ${userId.substring(0, 8)}`;
}
