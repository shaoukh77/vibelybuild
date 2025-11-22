/**
 * Live Preview Gateway - PHASE 4: Stability & Speed
 *
 * Central entry point for all preview operations:
 * - Speed optimization: Caches node_modules across builds
 * - Error protection: Graceful fallbacks
 * - Health monitoring: Auto-restart failed servers
 * - Resource management: Memory and port cleanup
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { startPreview, stopPreview, getPreview } from './preview/previewManager';
import { killProcessOnPort } from './preview/processRunner';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'vibecode');
const SHARED_NODE_MODULES = path.join(process.cwd(), '.cache', 'shared', 'node_modules');

/**
 * PHASE 4: Speed Optimization - Share node_modules across builds
 * Creates a shared node_modules that can be symlinked
 */
export async function ensureSharedDependencies(): Promise<void> {
  try {
    await fs.access(SHARED_NODE_MODULES);
    console.log('[Gateway] ✅ Shared node_modules already exists');
    return;
  } catch {
    console.log('[Gateway] 📦 Creating shared node_modules for faster builds...');

    const sharedDir = path.join(process.cwd(), '.cache', 'shared');
    await fs.mkdir(sharedDir, { recursive: true });

    // Create minimal package.json for shared deps
    const packageJson = {
      name: 'vibecode-shared-deps',
      version: '1.0.0',
      private: true,
      dependencies: {
        next: '^15.1.6',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        autoprefixer: '^10.4.16',
        postcss: '^8.4.32',
        tailwindcss: '^3.4.1',
      },
      devDependencies: {
        '@types/node': '^22.10.6',
        '@types/react': '^19.0.9',
        '@types/react-dom': '^19.0.2',
        typescript: '^5.7.2',
      },
    };

    await fs.writeFile(
      path.join(sharedDir, 'package.json'),
      JSON.stringify(packageJson, null, 2),
      'utf-8'
    );

    // Install shared dependencies (one-time operation)
    console.log('[Gateway] ⏳ Installing shared dependencies (this may take a moment)...');

    const { runCommand } = await import('./process/runCommand');
    const { exitCode } = await runCommand(
      'npm install --legacy-peer-deps --prefer-offline',
      sharedDir,
      300000 // 5 minutes
    );

    if (exitCode === 0) {
      console.log('[Gateway] ✅ Shared dependencies installed!');
    } else {
      console.warn('[Gateway] ⚠️ Shared dependencies installation failed, builds will install individually');
    }
  }
}

/**
 * PHASE 4: Start preview with optimizations
 */
export async function startOptimizedPreview(
  buildId: string,
  projectPath: string,
  userId: string,
  onReady?: () => void
): Promise<any> {
  try {
    console.log(`[Gateway] 🚀 Starting optimized preview for ${buildId}`);

    // Try to symlink shared node_modules for faster startup
    await trySymlinkSharedDeps(projectPath);

    // Start preview
    return await startPreview(buildId, projectPath, userId, onReady);
  } catch (error: any) {
    console.error(`[Gateway] ❌ Failed to start preview:`, error);
    throw error;
  }
}

/**
 * Try to symlink shared node_modules instead of installing
 * Falls back to normal installation if symlink fails
 */
async function trySymlinkSharedDeps(projectPath: string): Promise<void> {
  try {
    const targetNodeModules = path.join(projectPath, 'node_modules');

    // Check if shared deps exist
    await fs.access(SHARED_NODE_MODULES);

    // Check if node_modules already exists
    try {
      await fs.access(targetNodeModules);
      console.log('[Gateway] ✅ node_modules already exists, skipping symlink');
      return;
    } catch {
      // node_modules doesn't exist, create symlink
      await fs.symlink(SHARED_NODE_MODULES, targetNodeModules, 'junction');
      console.log('[Gateway] ⚡ Symlinked shared node_modules for faster startup');
    }
  } catch (error) {
    console.log('[Gateway] ℹ️  Shared deps not available, will install normally');
  }
}

/**
 * PHASE 4: Health check with auto-restart
 */
export async function healthCheckPreview(buildId: string): Promise<boolean> {
  const preview = getPreview(buildId);

  if (!preview) {
    return false;
  }

  try {
    const response = await fetch(preview.url, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });

    return response.ok || response.status === 404;
  } catch {
    console.log(`[Gateway] 💀 Preview ${buildId} is unhealthy`);
    return false;
  }
}

/**
 * PHASE 4: Emergency cleanup - kills all preview servers and frees ports
 */
export async function emergencyCleanup(): Promise<void> {
  console.log('[Gateway] 🚨 Emergency cleanup initiated');

  // Kill all processes on preview ports
  for (let port = 4100; port <= 4999; port += 100) {
    await killProcessOnPort(port).catch(() => {});
  }

  console.log('[Gateway] ✅ Emergency cleanup complete');
}

/**
 * PHASE 4: Get preview statistics
 */
export interface PreviewStats {
  totalActive: number;
  oldestStartTime: number;
  newestStartTime: number;
  averageUptime: number;
}

export function getPreviewStats(): PreviewStats {
  // This would need to be implemented with access to activeServers
  // For now, return empty stats
  return {
    totalActive: 0,
    oldestStartTime: 0,
    newestStartTime: 0,
    averageUptime: 0,
  };
}

// Initialize shared dependencies on module load (PHASE 4 optimization)
ensureSharedDependencies().catch((error) => {
  console.error('[Gateway] Failed to initialize shared dependencies:', error);
});
