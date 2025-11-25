/**
 * Publisher - Main logic for publishing apps to VibelyBuild Store
 *
 * Handles complete publishing workflow:
 * - Zip project bundle
 * - Capture screenshot
 * - Upload to Firestore
 * - Generate public Store URL
 */

import { nanoid } from 'nanoid';
import * as path from 'path';
import { createProjectZip, validateProjectPath } from '@/lib/store/zipUtils';
import { capturePreviewScreenshot, validatePreviewUrl, generateFallbackScreenshot } from '@/lib/store/screenshot';
import { collection, doc, setDoc, serverTimestamp, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'vibecode');

export interface PublishAppParams {
  userId: string;
  jobId: string;
  appName: string;
  description: string;
  previewUrl: string;
}

export interface PublishedApp {
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
}

export interface PublishResult {
  success: boolean;
  appId?: string;
  storeUrl?: string;
  message?: string;
  error?: string;
  screenshotUrl?: string;
  bundleUrl?: string;
}

/**
 * Publish an app to the VibelyBuild Store
 */
export async function publishAppToStore(params: PublishAppParams): Promise<PublishResult> {
  const { userId, jobId, appName, description, previewUrl } = params;

  console.log(`\n[Publisher] 🚀 STARTING STORE PUBLISH WORKFLOW`);
  console.log(`[Publisher] User: ${userId}`);
  console.log(`[Publisher] Job: ${jobId}`);
  console.log(`[Publisher] App: ${appName}`);

  try {
    // Step 1: Validate inputs
    console.log(`[Publisher] ✅ Step 1/6: Validating inputs...`);

    if (!appName || appName.trim().length === 0) {
      throw new Error('App name is required');
    }

    if (!description || description.trim().length === 0) {
      throw new Error('Description is required');
    }

    if (!validatePreviewUrl(previewUrl)) {
      throw new Error('Invalid preview URL');
    }

    console.log(`[Publisher] ✅ Inputs validated`);

    // Step 2: Validate project path
    console.log(`[Publisher] ✅ Step 2/6: Validating project path...`);

    const projectPath = path.join(CACHE_DIR, jobId, 'generated');
    const isValidPath = await validateProjectPath(projectPath);

    if (!isValidPath) {
      throw new Error(`Project not found or invalid: ${projectPath}`);
    }

    console.log(`[Publisher] ✅ Project path validated: ${projectPath}`);

    // Step 3: Generate unique app ID
    const appId = nanoid(12);
    console.log(`[Publisher] ✅ Generated app ID: ${appId}`);

    // Step 4: Create ZIP bundle
    console.log(`[Publisher] ✅ Step 3/6: Creating ZIP bundle...`);

    const zipResult = await createProjectZip(projectPath, appId, userId, appName);

    if (!zipResult.success || !zipResult.publicUrl) {
      throw new Error(zipResult.error || 'Failed to create ZIP bundle');
    }

    console.log(`[Publisher] ✅ ZIP bundle created: ${zipResult.publicUrl}`);
    console.log(`[Publisher] 📊 Bundle size: ${(zipResult.fileSize! / (1024 * 1024)).toFixed(2)} MB`);

    // Step 5: Capture screenshot
    console.log(`[Publisher] ✅ Step 4/6: Capturing preview screenshot...`);

    let screenshotResult = await capturePreviewScreenshot(previewUrl, appId, userId);

    // If screenshot capture fails, generate fallback
    if (!screenshotResult.success) {
      console.warn(`[Publisher] ⚠️  Screenshot capture failed, generating fallback...`);
      screenshotResult = await generateFallbackScreenshot(appId, userId, appName);
    }

    if (!screenshotResult.success || !screenshotResult.publicUrl) {
      throw new Error('Failed to generate screenshot or fallback');
    }

    console.log(`[Publisher] ✅ Screenshot ready: ${screenshotResult.publicUrl}`);

    // Step 6: Generate Store URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibelybuildai.com';
    const storeUrl = `${baseUrl}/store/app/${appId}`;

    console.log(`[Publisher] ✅ Store URL: ${storeUrl}`);

    // Step 7: Save to Firestore
    console.log(`[Publisher] ✅ Step 5/6: Saving to Firestore...`);

    const publishedApp: PublishedApp = {
      appId,
      userId,
      jobId,
      appName: appName.trim(),
      description: description.trim(),
      previewUrl,
      screenshotUrl: screenshotResult.publicUrl,
      bundleUrl: zipResult.publicUrl,
      bundleSize: zipResult.fileSize!,
      storeUrl,
      publishedAt: serverTimestamp(),
      views: 0,
      likes: 0,
      status: 'published',
    };

    await saveAppToFirestore(appId, userId, publishedApp);

    console.log(`[Publisher] ✅ App saved to Firestore`);

    // Step 8: Complete
    console.log(`[Publisher] ✅ Step 6/6: Publish complete!`);
    console.log(`[Publisher] 🎉 App successfully published to VibelyBuild Store!`);

    return {
      success: true,
      appId,
      storeUrl,
      message: 'App successfully published to VibelyBuild Store!',
      screenshotUrl: screenshotResult.publicUrl,
      bundleUrl: zipResult.publicUrl,
    };

  } catch (error: any) {
    console.error(`[Publisher] ❌ PUBLISH FAILED:`, error);

    return {
      success: false,
      error: error.message || 'Failed to publish app to Store',
    };
  }
}

/**
 * Save published app to Firestore
 */
async function saveAppToFirestore(
  appId: string,
  userId: string,
  appData: PublishedApp
): Promise<void> {
  try {
    // Save to store/apps/<appId> (global store)
    const appRef = doc(db, 'store', 'apps', appId);
    await setDoc(appRef, appData);

    console.log(`[Publisher] ✅ Saved to store/apps/${appId}`);

    // Also save to user's collection for easy retrieval
    const userAppRef = doc(db, 'users', userId, 'published_apps', appId);
    await setDoc(userAppRef, {
      appId,
      appName: appData.appName,
      storeUrl: appData.storeUrl,
      screenshotUrl: appData.screenshotUrl,
      publishedAt: appData.publishedAt,
      views: 0,
      likes: 0,
    });

    console.log(`[Publisher] ✅ Saved to users/${userId}/published_apps/${appId}`);

  } catch (error: any) {
    console.error(`[Publisher] ❌ Firestore save failed:`, error);
    throw new Error(`Failed to save to Firestore: ${error.message}`);
  }
}

/**
 * Unpublish (delete) an app from the Store
 */
export async function unpublishApp(appId: string, userId: string): Promise<boolean> {
  console.log(`[Publisher] 🗑️  Unpublishing app ${appId}...`);

  try {
    // Delete from global store
    const appRef = doc(db, 'store', 'apps', appId);
    await deleteDoc(appRef);

    // Delete from user's collection
    const userAppRef = doc(db, 'users', userId, 'published_apps', appId);
    await deleteDoc(userAppRef);

    console.log(`[Publisher] ✅ App unpublished successfully`);
    return true;

  } catch (error: any) {
    console.error(`[Publisher] ❌ Unpublish failed:`, error);
    return false;
  }
}

/**
 * Get published app data from Firestore
 */
export async function getPublishedApp(appId: string): Promise<PublishedApp | null> {
  try {
    const appRef = doc(db, 'store', 'apps', appId);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      return null;
    }

    return appSnap.data() as PublishedApp;

  } catch (error: any) {
    console.error(`[Publisher] ❌ Failed to get app:`, error);
    return null;
  }
}

/**
 * Increment view count for an app
 */
export async function incrementAppViews(appId: string): Promise<void> {
  try {
    const appRef = doc(db, 'store', 'apps', appId);
    const appSnap = await getDoc(appRef);

    if (appSnap.exists()) {
      const currentViews = appSnap.data().views || 0;
      await setDoc(appRef, { views: currentViews + 1 }, { merge: true });
      console.log(`[Publisher] ✅ Incremented views for app ${appId}`);
    }

  } catch (error: any) {
    console.error(`[Publisher] ❌ Failed to increment views:`, error);
  }
}

/**
 * Increment like count for an app
 */
export async function incrementAppLikes(appId: string): Promise<void> {
  try {
    const appRef = doc(db, 'store', 'apps', appId);
    const appSnap = await getDoc(appRef);

    if (appSnap.exists()) {
      const currentLikes = appSnap.data().likes || 0;
      await setDoc(appRef, { likes: currentLikes + 1 }, { merge: true });
      console.log(`[Publisher] ✅ Incremented likes for app ${appId}`);
    }

  } catch (error: any) {
    console.error(`[Publisher] ❌ Failed to increment likes:`, error);
  }
}

/**
 * Validate publish parameters
 */
export function validatePublishParams(params: Partial<PublishAppParams>): string | null {
  if (!params.userId || params.userId.trim().length === 0) {
    return 'User ID is required';
  }

  if (!params.jobId || params.jobId.trim().length === 0) {
    return 'Job ID is required';
  }

  if (!params.appName || params.appName.trim().length === 0) {
    return 'App name is required';
  }

  if (!params.description || params.description.trim().length === 0) {
    return 'Description is required';
  }

  if (!params.previewUrl || params.previewUrl.trim().length === 0) {
    return 'Preview URL is required';
  }

  if (params.appName.length > 100) {
    return 'App name must be 100 characters or less';
  }

  if (params.description.length > 500) {
    return 'Description must be 500 characters or less';
  }

  if (!validatePreviewUrl(params.previewUrl)) {
    return 'Invalid preview URL format';
  }

  return null;
}
