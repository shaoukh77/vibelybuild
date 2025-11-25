/**
 * Zip Utils - Create project bundles for Store publishing
 *
 * Uses archiver to compress generated Next.js apps into downloadable bundles
 */

import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

const STORE_BUNDLES_DIR = path.join(process.cwd(), 'public', 'store_bundles');

export interface ZipResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  fileSize?: number;
  error?: string;
}

/**
 * Create a ZIP bundle of a generated project
 */
export async function createProjectZip(
  projectPath: string,
  appId: string,
  userId: string,
  appName: string
): Promise<ZipResult> {
  console.log(`[ZipUtils] 📦 Starting ZIP creation for app ${appId}`);
  console.log(`[ZipUtils] Project path: ${projectPath}`);

  try {
    // Step 1: Ensure bundles directory exists
    const userDir = path.join(STORE_BUNDLES_DIR, userId);
    await fs.promises.mkdir(userDir, { recursive: true });
    console.log(`[ZipUtils] ✅ Bundles directory ready`);

    // Step 2: Create output ZIP path
    const zipFileName = `${appId}.zip`;
    const zipPath = path.join(userDir, zipFileName);

    // Delete existing ZIP if it exists
    try {
      await fs.promises.unlink(zipPath);
      console.log(`[ZipUtils] 🗑️  Deleted existing ZIP`);
    } catch {
      // Ignore if doesn't exist
    }

    // Step 3: Create archiver instance
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    console.log(`[ZipUtils] 🗜️  Archiver initialized with max compression`);

    // Step 4: Set up event handlers
    let totalBytes = 0;

    output.on('close', () => {
      totalBytes = archive.pointer();
      console.log(`[ZipUtils] ✅ ZIP created: ${totalBytes} bytes`);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn(`[ZipUtils] ⚠️  Archive warning:`, err);
      } else {
        throw err;
      }
    });

    archive.on('error', (err) => {
      throw err;
    });

    // Step 5: Pipe archive to output file
    archive.pipe(output);

    // Step 6: Add project files to archive (excluding unnecessary files)
    console.log(`[ZipUtils] 📂 Adding project files to archive...`);

    const excludePatterns = [
      'node_modules',
      '.next',
      '.turbo',
      '.git',
      'dist',
      'build',
      '.cache',
      '.DS_Store',
      'npm-debug.log',
      'yarn-error.log',
      '.env.local',
      '.env.production',
    ];

    // Add directory with exclusions
    archive.glob('**/*', {
      cwd: projectPath,
      ignore: excludePatterns.map(pattern => `**/${pattern}/**`),
      dot: true, // Include hidden files (like .gitignore)
    });

    console.log(`[ZipUtils] ✅ Files added to archive (excluding: ${excludePatterns.join(', ')})`);

    // Step 7: Finalize archive
    console.log(`[ZipUtils] 🔒 Finalizing ZIP...`);
    await archive.finalize();

    // Step 8: Wait for stream to close
    await new Promise<void>((resolve, reject) => {
      output.on('close', () => resolve());
      output.on('error', reject);
    });

    console.log(`[ZipUtils] ✅ ZIP finalized successfully`);

    // Step 9: Get file stats
    const stats = await fs.promises.stat(zipPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`[ZipUtils] 📊 ZIP size: ${fileSizeMB} MB`);

    // Step 10: Generate public URL
    const publicUrl = `/store_bundles/${userId}/${zipFileName}`;

    console.log(`[ZipUtils] 🎉 ZIP creation complete!`);
    console.log(`[ZipUtils] Public URL: ${publicUrl}`);

    return {
      success: true,
      filePath: zipPath,
      publicUrl,
      fileSize: stats.size,
    };

  } catch (error: any) {
    console.error(`[ZipUtils] ❌ ZIP creation failed:`, error);

    return {
      success: false,
      error: error.message || 'ZIP creation failed',
    };
  }
}

/**
 * Delete a ZIP bundle
 */
export async function deleteProjectZip(appId: string, userId: string): Promise<boolean> {
  try {
    const zipPath = path.join(STORE_BUNDLES_DIR, userId, `${appId}.zip`);
    await fs.promises.unlink(zipPath);
    console.log(`[ZipUtils] 🗑️  Deleted ZIP bundle: ${zipPath}`);
    return true;
  } catch (error) {
    console.error(`[ZipUtils] ⚠️  Failed to delete ZIP bundle:`, error);
    return false;
  }
}

/**
 * Get ZIP file size in bytes
 */
export async function getZipSize(appId: string, userId: string): Promise<number | null> {
  try {
    const zipPath = path.join(STORE_BUNDLES_DIR, userId, `${appId}.zip`);
    const stats = await fs.promises.stat(zipPath);
    return stats.size;
  } catch {
    return null;
  }
}

/**
 * Validate project path before zipping
 */
export async function validateProjectPath(projectPath: string): Promise<boolean> {
  try {
    // Check if directory exists
    const stats = await fs.promises.stat(projectPath);
    if (!stats.isDirectory()) {
      return false;
    }

    // Check if it's a valid Next.js project
    const packageJsonPath = path.join(projectPath, 'package.json');
    await fs.promises.access(packageJsonPath);

    return true;
  } catch {
    return false;
  }
}

/**
 * Estimate project size before zipping
 */
export async function estimateProjectSize(projectPath: string): Promise<number> {
  let totalSize = 0;

  async function walkDir(dir: string) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip excluded directories
      if (entry.isDirectory()) {
        if (['node_modules', '.next', '.turbo', '.git'].includes(entry.name)) {
          continue;
        }
        await walkDir(fullPath);
      } else {
        const stats = await fs.promises.stat(fullPath);
        totalSize += stats.size;
      }
    }
  }

  try {
    await walkDir(projectPath);
  } catch (error) {
    console.error('[ZipUtils] Error estimating size:', error);
  }

  return totalSize;
}
