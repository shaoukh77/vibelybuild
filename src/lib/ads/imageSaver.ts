/**
 * Image Saver Utility
 * Downloads and saves AI-generated ad images to /public/generated_ads/
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const GENERATED_ADS_DIR = path.join(process.cwd(), 'public', 'generated_ads');

export interface SavedImage {
  url: string;
  filename: string;
  localPath: string;
}

/**
 * Save image from URL to local disk
 */
export async function saveImageFromUrl(
  imageUrl: string,
  sessionId: string,
  filename: string
): Promise<SavedImage> {
  try {
    // Create session directory if it doesn't exist
    const sessionDir = path.join(GENERATED_ADS_DIR, sessionId);
    await fs.mkdir(sessionDir, { recursive: true });

    // Full path to save the image
    const imagePath = path.join(sessionDir, filename);

    console.log('[Image Saver] Downloading image from OpenAI...');

    // Download image from URL using native fetch
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body from image URL');
    }

    // Convert response to buffer and save
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(imagePath, buffer);

    console.log('[Image Saver] Saved image to:', imagePath);

    // Return public URL
    const publicUrl = `/generated_ads/${sessionId}/${filename}`;

    return {
      url: publicUrl,
      filename,
      localPath: imagePath,
    };

  } catch (error: any) {
    console.error('[Image Saver] Error saving image:', error.message);
    throw new Error(`Failed to save image: ${error.message}`);
  }
}

/**
 * Delete old generated ads (cleanup utility)
 * Call this periodically to free up disk space
 */
export async function cleanupOldAds(olderThanDays: number = 7): Promise<number> {
  try {
    const entries = await fs.readdir(GENERATED_ADS_DIR, { withFileTypes: true });
    const now = Date.now();
    const maxAge = olderThanDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirPath = path.join(GENERATED_ADS_DIR, entry.name);
        const stats = await fs.stat(dirPath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          await fs.rm(dirPath, { recursive: true });
          deletedCount++;
          console.log('[Image Saver] Deleted old ad directory:', entry.name);
        }
      }
    }

    console.log(`[Image Saver] Cleanup complete: ${deletedCount} directories deleted`);
    return deletedCount;

  } catch (error: any) {
    console.error('[Image Saver] Cleanup error:', error.message);
    return 0;
  }
}
