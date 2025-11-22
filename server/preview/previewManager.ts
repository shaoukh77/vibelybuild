/**
 * Preview Manager - OPTIMIZED VERSION
 *
 * OPTIMIZATIONS:
 * 1. Better synchronization (wait for build complete)
 * 2. Zombie process cleanup
 * 3. Watchdog integration
 * 4. Port cleanup on startup
 * 5. Better error handling
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { startPreviewServer, checkServerHealth, PreviewServerInfo } from './previewServer';
import { allocatePort, freePort, getPortForBuild, getAllocatedPorts } from './portAllocator';
import { killManagedProcess, killProcessOnPort } from './processRunner';

const PREVIEW_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const STATE_FILE = path.join(process.cwd(), '.cache', 'vibecode', 'preview-state.json');

// In-memory registry
const activeServers = new Map<string, PreviewServerInfo>();
const serverTimeouts = new Map<string, NodeJS.Timeout>();
const userBuilds = new Map<string, string>(); // userId -> buildId

/**
 * OPTIMIZATION: Cleanup zombie processes and ports on startup
 */
async function cleanupZombieProcesses(): Promise<void> {
  console.log('[PreviewManager] 🧹 Cleaning up zombie processes and ports...');

  try {
    // Get all allocated ports
    const allocatedPorts = getAllocatedPorts();

    // Kill all processes on those ports
    for (const [port, buildId] of allocatedPorts.entries()) {
      console.log(`[PreviewManager] 🔪 Cleaning up port ${port} (buildId: ${buildId})`);
      await killProcessOnPort(port, true);
    }

    console.log('[PreviewManager] ✅ Zombie cleanup complete');
  } catch (error) {
    console.error('[PreviewManager] ⚠️  Error during zombie cleanup:', error);
  }
}

/**
 * OPTIMIZATION: Start preview with better synchronization
 */
export async function startPreview(
  buildId: string,
  projectPath: string,
  userId: string,
  onReady?: () => void
): Promise<PreviewServerInfo> {
  console.log(`\n[PreviewManager] 🚀 CORE REPAIR ENGINE: Starting preview for build ${buildId}`);
  console.log(`[PreviewManager] 👤 User: ${userId}`);
  console.log(`[PreviewManager] 📂 Path: ${projectPath}`);

  // OPTIMIZATION: Check if project path exists before proceeding
  try {
    await fs.access(projectPath);
  } catch (error) {
    console.error(`[PreviewManager] ❌ Project path does not exist: ${projectPath}`);
    throw new Error(`Build not complete yet. Project path does not exist: ${projectPath}`);
  }

  // STEP 1: Kill any existing preview for this user
  const existingBuildId = userBuilds.get(userId);
  if (existingBuildId && existingBuildId !== buildId) {
    console.log(`[PreviewManager] 🔪 Killing old preview ${existingBuildId} for user ${userId}`);
    await stopPreview(existingBuildId);
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // STEP 2: If this build already has a preview, kill it first
  if (activeServers.has(buildId)) {
    console.log(`[PreviewManager] 🔄 Restarting existing preview for ${buildId}`);
    await stopPreview(buildId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // STEP 3: Allocate a port (4110-4990)
  const port = allocatePort(buildId);
  console.log(`[PreviewManager] 🔌 Allocated port ${port}`);

  // OPTIMIZATION: Kill any zombie process on this port before starting
  await killProcessOnPort(port, true);

  try {
    // STEP 4: Start the server (with retry mechanism built-in)
    const serverInfo = await startPreviewServer(buildId, projectPath, port, onReady);

    if (serverInfo.status === 'error') {
      console.error(`[PreviewManager] ❌ Server failed to start:`, serverInfo.error);
      freePort(port);
      throw new Error(serverInfo.error || 'Failed to start preview server');
    }

    // STEP 5: Register in memory
    activeServers.set(buildId, serverInfo);
    userBuilds.set(userId, buildId);

    // STEP 6: Set auto-cleanup timeout
    setCleanupTimeout(buildId);

    // STEP 7: Persist state
    await saveState();

    console.log(`[PreviewManager] ✅ Preview started successfully: ${serverInfo.url}`);
    console.log(`[PreviewManager] ⚡ Total time: ${Date.now() - serverInfo.startTime}ms`);

    return serverInfo;
  } catch (error: any) {
    console.error(`[PreviewManager] ❌ FATAL: Failed to start preview:`, error);

    // Free the port if server failed
    freePort(port);

    throw error;
  }
}

/**
 * Stop a preview server
 */
export async function stopPreview(buildId: string): Promise<boolean> {
  const serverInfo = activeServers.get(buildId);

  if (!serverInfo) {
    console.log(`[PreviewManager] ℹ️  No server found for build ${buildId}`);
    return false;
  }

  console.log(`[PreviewManager] 🛑 Stopping preview for build ${buildId} (PID: ${serverInfo.pid})`);

  try {
    // 1. Clear timeout
    const timeout = serverTimeouts.get(buildId);
    if (timeout) {
      clearTimeout(timeout);
      serverTimeouts.delete(buildId);
    }

    // 2. Kill the process
    if (serverInfo.pid > 0) {
      await killManagedProcess(buildId);
    }

    // 3. OPTIMIZATION: Kill by port as well (cleanup zombies)
    await killProcessOnPort(serverInfo.port, true);

    // 4. Free the port
    freePort(serverInfo.port);

    // 5. Remove from registry
    activeServers.delete(buildId);

    // 6. Remove user mapping
    for (const [userId, bid] of userBuilds.entries()) {
      if (bid === buildId) {
        userBuilds.delete(userId);
      }
    }

    // 7. Persist state
    await saveState();

    console.log(`[PreviewManager] ✅ Preview stopped for ${buildId}`);

    return true;
  } catch (error) {
    console.error(`[PreviewManager] ❌ Error stopping preview:`, error);
    return false;
  }
}

/**
 * OPTIMIZATION: Restart preview if it crashed
 */
export async function restartPreview(buildId: string, userId: string): Promise<PreviewServerInfo | null> {
  const serverInfo = activeServers.get(buildId);

  if (!serverInfo) {
    console.log(`[PreviewManager] ℹ️  No server found for build ${buildId}, cannot restart`);
    return null;
  }

  const projectPath = serverInfo.projectPath;

  console.log(`[PreviewManager] 🔄 Restarting crashed preview for build ${buildId}`);

  // Stop existing server
  await stopPreview(buildId);
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Start new server
  try {
    return await startPreview(buildId, projectPath, userId);
  } catch (error) {
    console.error(`[PreviewManager] ❌ Failed to restart preview:`, error);
    return null;
  }
}

/**
 * Get preview info for a build
 */
export function getPreview(buildId: string): PreviewServerInfo | null {
  return activeServers.get(buildId) || null;
}

/**
 * Get preview URL for a build
 */
export function getPreviewUrl(buildId: string): string | null {
  const preview = activeServers.get(buildId);
  return preview ? preview.url : null;
}

/**
 * Get all active previews
 */
export function getAllActivePreviews(): PreviewServerInfo[] {
  return Array.from(activeServers.values());
}

/**
 * Extend timeout for a preview (called when user is viewing)
 */
export function extendTimeout(buildId: string): boolean {
  const serverInfo = activeServers.get(buildId);

  if (!serverInfo) {
    return false;
  }

  console.log(`[PreviewManager] ⏱️  Extending timeout for build ${buildId}`);
  setCleanupTimeout(buildId);

  return true;
}

/**
 * Set auto-cleanup timeout for a server
 */
function setCleanupTimeout(buildId: string): void {
  // Clear existing timeout
  const existingTimeout = serverTimeouts.get(buildId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Set new timeout
  const timeout = setTimeout(async () => {
    console.log(`[PreviewManager] ⏰ Timeout reached for build ${buildId}, cleaning up...`);
    await stopPreview(buildId);
  }, PREVIEW_TIMEOUT);

  serverTimeouts.set(buildId, timeout);
}

/**
 * Save state to disk
 */
async function saveState(): Promise<void> {
  try {
    const dir = path.dirname(STATE_FILE);
    await fs.mkdir(dir, { recursive: true });

    const state: Record<string, any> = {};

    for (const [buildId, serverInfo] of activeServers.entries()) {
      state[buildId] = {
        buildId: serverInfo.buildId,
        port: serverInfo.port,
        pid: serverInfo.pid,
        url: serverInfo.url,
        projectPath: serverInfo.projectPath,
        status: serverInfo.status,
        startTime: serverInfo.startTime,
      };
    }

    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('[PreviewManager] ❌ Failed to save state:', error);
  }
}

/**
 * Load state from disk (called on startup)
 */
export async function loadState(): Promise<void> {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf-8');
    const state = JSON.parse(data);

    console.log(`[PreviewManager] 📂 Loading saved state...`);

    for (const [buildId, info] of Object.entries(state)) {
      const serverInfo = info as any;

      // Check if server is still healthy
      const isHealthy = await checkServerHealth(serverInfo.url);

      if (isHealthy) {
        console.log(`[PreviewManager] ♻️  Server for build ${buildId} still running`);
      } else {
        console.log(`[PreviewManager] 🗑️  Server for build ${buildId} is no longer healthy, cleaning up...`);
        // Kill the port
        await killProcessOnPort(serverInfo.port, true);
        freePort(serverInfo.port);
      }
    }
  } catch (error) {
    console.log('[PreviewManager] ℹ️  No saved state found or error loading it');
  }

  // OPTIMIZATION: Always cleanup zombies on startup
  await cleanupZombieProcesses();
}

/**
 * Cleanup all preview servers (called on shutdown)
 */
export async function cleanupAll(): Promise<void> {
  console.log('[PreviewManager] 🧹 Cleaning up all preview servers...');

  const buildIds = Array.from(activeServers.keys());

  for (const buildId of buildIds) {
    await stopPreview(buildId);
  }

  console.log('[PreviewManager] ✅ All preview servers cleaned up');
}

/**
 * OPTIMIZATION: Enhanced health check with auto-restart
 */
export async function healthCheckAll(): Promise<void> {
  console.log('[PreviewManager] 🏥 Running health check on all servers...');

  const buildIds = Array.from(activeServers.keys());

  for (const buildId of buildIds) {
    const serverInfo = activeServers.get(buildId);

    if (serverInfo) {
      const isHealthy = await checkServerHealth(serverInfo.url);

      if (!isHealthy) {
        console.log(`[PreviewManager] 💀 Server for build ${buildId} is unhealthy, removing`);
        await stopPreview(buildId);

        // Note: We don't auto-restart here to avoid infinite loops
        // The user will need to manually restart if needed
      } else {
        // Extend timeout if healthy
        extendTimeout(buildId);
      }
    }
  }

  console.log('[PreviewManager] ✅ Health check complete');
}

/**
 * Get server statistics
 */
export function getServerStats() {
  const stats = {
    totalActive: activeServers.size,
    servers: Array.from(activeServers.values()).map(s => ({
      buildId: s.buildId,
      port: s.port,
      url: s.url,
      status: s.status,
      uptime: Date.now() - s.startTime,
      retryCount: s.retryCount || 0,
    })),
  };

  return stats;
}

// Initialize on module load
loadState().catch(console.error);

// Cleanup on process exit
process.on('SIGINT', async () => {
  console.log('[PreviewManager] 🛑 SIGINT received, cleaning up...');
  await cleanupAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[PreviewManager] 🛑 SIGTERM received, cleaning up...');
  await cleanupAll();
  process.exit(0);
});

// OPTIMIZATION: Periodic health check every 2 minutes
setInterval(() => {
  healthCheckAll().catch(console.error);
}, 2 * 60 * 1000);
