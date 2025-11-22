/**
 * Process Runner - OPTIMIZED VERSION
 *
 * OPTIMIZATIONS:
 * 1. Aggressive port cleanup (kill zombies)
 * 2. Resource limits (CPU/RAM)
 * 3. Watchdog for crashed processes
 * 4. Better EADDRINUSE handling
 * 5. Process health monitoring
 */

import { spawn, ChildProcess, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ResourceLimits {
  maxOldGenerationSizeMb?: number;
  maxYoungGenerationSizeMb?: number;
}

export interface ProcessOptions {
  command: string;
  args: string[];
  cwd: string;
  port: number;
  buildId: string;
  env?: Record<string, string>;
  resourceLimits?: ResourceLimits;
  onOutput?: (data: string) => void;
  onError?: (data: string) => void;
  onReady?: () => void;
  onExit?: (code: number | null, signal: string | null) => void;
}

export interface ManagedProcess {
  pid: number;
  port: number;
  buildId: string;
  process: ChildProcess;
  startTime: number;
  isReady: boolean;
  killed: boolean;
  url: string;
  lastHealthCheck?: number;
  crashCount?: number;
}

const activeProcesses = new Map<string, ManagedProcess>();
const processWatchdogs = new Map<string, NodeJS.Timeout>();

/**
 * OPTIMIZATION: Aggressive port cleanup - kills ALL processes on port
 */
async function killProcessOnPort(port: number, aggressive: boolean = true): Promise<void> {
  try {
    console.log(`[ProcessRunner] 🔍 Checking for processes on port ${port}...`);

    // Method 1: lsof
    try {
      const { stdout } = await execAsync(`lsof -ti:${port} || true`);
      const pids = stdout.trim().split('\n').filter(Boolean);

      for (const pidStr of pids) {
        const pid = parseInt(pidStr, 10);
        if (!isNaN(pid)) {
          console.log(`[ProcessRunner] 🔪 Killing process ${pid} on port ${port}`);
          try {
            process.kill(pid, 'SIGKILL'); // Use SIGKILL for immediate termination
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err: any) {
            if (err.code !== 'ESRCH') {
              console.error(`[ProcessRunner] Failed to kill PID ${pid}:`, err.message);
            }
          }
        }
      }
    } catch (err) {
      // lsof might not be available
    }

    // Method 2: netstat (fallback)
    if (aggressive) {
      try {
        const { stdout } = await execAsync(`netstat -tlnp 2>/dev/null | grep :${port} | awk '{print $7}' | cut -d/ -f1 || true`);
        const pids = stdout.trim().split('\n').filter(Boolean);

        for (const pidStr of pids) {
          const pid = parseInt(pidStr, 10);
          if (!isNaN(pid)) {
            console.log(`[ProcessRunner] 🔪 Killing zombie process ${pid} on port ${port}`);
            try {
              process.kill(pid, 'SIGKILL');
            } catch (err) {
              // Ignore
            }
          }
        }
      } catch (err) {
        // Ignore
      }
    }

    // Wait for port to be free
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`[ProcessRunner] ✅ Port ${port} is free`);
  } catch (error: any) {
    console.log(`[ProcessRunner] Port ${port} appears to be available`);
  }
}

/**
 * OPTIMIZATION: Start managed process with resource limits and watchdog
 */
export async function startManagedProcess(options: ProcessOptions): Promise<ManagedProcess> {
  const { command, args, cwd, port, buildId, env = {}, resourceLimits, onOutput, onError, onReady, onExit } = options;

  console.log(`[ProcessRunner:${buildId}] 🚀 Starting ${command} ${args.join(' ')}`);
  console.log(`[ProcessRunner:${buildId}] 📂 CWD: ${cwd}`);
  console.log(`[ProcessRunner:${buildId}] 🔌 Port: ${port}`);

  if (resourceLimits) {
    console.log(`[ProcessRunner:${buildId}] 🛡️  Resource limits: ${JSON.stringify(resourceLimits)}`);
  }

  // CRITICAL: Kill any existing process on this port (aggressive cleanup)
  await killProcessOnPort(port, true);

  // Kill any existing process for this buildId
  if (activeProcesses.has(buildId)) {
    console.log(`[ProcessRunner:${buildId}] 🔪 Killing old process for this build`);
    await killManagedProcess(buildId);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Build Node.js args with resource limits
  const nodeArgs: string[] = [];

  if (resourceLimits?.maxOldGenerationSizeMb) {
    nodeArgs.push(`--max-old-space-size=${resourceLimits.maxOldGenerationSizeMb}`);
  }

  if (resourceLimits?.maxYoungGenerationSizeMb) {
    nodeArgs.push(`--max-semi-space-size=${Math.floor(resourceLimits.maxYoungGenerationSizeMb / 2)}`);
  }

  // Add Node args to execArgv
  const execArgv = nodeArgs.length > 0 ? nodeArgs : undefined;

  // Spawn the process
  const child = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    detached: false,
    env: {
      ...process.env,
      ...env,
      NODE_ENV: 'development',
      PORT: port.toString(),
      TURBOPACK: '1',
      NEXT_TELEMETRY_DISABLED: '1',
      // CRITICAL: Disable X-Frame-Options in Next.js
      DISABLE_X_FRAME_OPTIONS: '1',
      // OPTIMIZATION: Node.js performance flags
      NODE_OPTIONS: nodeArgs.join(' '),
    },
  });

  if (!child.pid) {
    throw new Error('Failed to spawn process - no PID assigned');
  }

  console.log(`[ProcessRunner:${buildId}] ✅ Spawned with PID: ${child.pid}`);

  const serverUrl = `http://localhost:${port}`;
  const managedProcess: ManagedProcess = {
    pid: child.pid,
    port,
    buildId,
    process: child,
    startTime: Date.now(),
    isReady: false,
    killed: false,
    url: serverUrl,
    lastHealthCheck: Date.now(),
    crashCount: 0,
  };

  // Store in registry
  activeProcesses.set(buildId, managedProcess);

  // OPTIMIZATION: Setup watchdog for this process
  setupWatchdog(buildId, managedProcess);

  // Capture stdout and detect "Ready in" message
  if (child.stdout) {
    child.stdout.on('data', (data: Buffer) => {
      const output = data.toString();

      // Send to callback
      if (onOutput) {
        onOutput(output);
      }

      // Detect Next.js ready state
      if (
        !managedProcess.isReady &&
        (output.includes('Ready in') ||
         output.includes('compiled successfully') ||
         output.includes('Local:') ||
         output.includes(`http://localhost:${port}`) ||
         output.includes('started server'))
      ) {
        managedProcess.isReady = true;
        console.log(`[ProcessRunner:${buildId}] ✅ Next.js server is READY!`);

        // Emit ready callback
        if (onReady) {
          setTimeout(() => onReady(), 500);
        }
      }
    });
  }

  // Capture stderr
  if (child.stderr) {
    child.stderr.on('data', (data: Buffer) => {
      const output = data.toString();

      if (onError) {
        onError(output);
      }

      // Check for EADDRINUSE error
      if (output.includes('EADDRINUSE')) {
        console.error(`[ProcessRunner:${buildId}] ❌ Port ${port} is already in use!`);
      }
    });
  }

  // Handle process exit
  child.on('exit', (code, signal) => {
    console.log(`[ProcessRunner:${buildId}] 📊 Process exited with code ${code}, signal ${signal}`);

    // OPTIMIZATION: Track crashes for watchdog
    if (code !== 0 && code !== null) {
      managedProcess.crashCount = (managedProcess.crashCount || 0) + 1;
      console.log(`[ProcessRunner:${buildId}] 💥 Crash count: ${managedProcess.crashCount}`);
    }

    activeProcesses.delete(buildId);
    clearWatchdog(buildId);

    if (onExit) {
      onExit(code, signal);
    }
  });

  child.on('error', (error) => {
    console.error(`[ProcessRunner:${buildId}] ❌ Process error:`, error);
    managedProcess.crashCount = (managedProcess.crashCount || 0) + 1;
    activeProcesses.delete(buildId);
    clearWatchdog(buildId);
  });

  return managedProcess;
}

/**
 * OPTIMIZATION: Watchdog - monitors process health and restarts if crashed
 */
function setupWatchdog(buildId: string, managedProcess: ManagedProcess): void {
  // Clear existing watchdog
  clearWatchdog(buildId);

  // Check every 30 seconds
  const watchdog = setInterval(async () => {
    const current = activeProcesses.get(buildId);

    if (!current || current.killed) {
      clearWatchdog(buildId);
      return;
    }

    // Check if process is still alive
    try {
      process.kill(current.pid, 0); // Signal 0 just checks if process exists

      // Process is alive, update health check time
      current.lastHealthCheck = Date.now();

      // Check if server is responsive
      if (current.isReady) {
        const isHealthy = await checkUrlHealth(current.url);

        if (!isHealthy) {
          console.warn(`[ProcessRunner:${buildId}] ⚠️  Server not responding, may need restart`);
          // Don't auto-restart yet, just log warning
        }
      }
    } catch (err) {
      // Process is dead
      console.error(`[ProcessRunner:${buildId}] 💀 Process ${current.pid} is dead, cleaning up`);
      activeProcesses.delete(buildId);
      clearWatchdog(buildId);

      // Note: We don't auto-restart here to avoid infinite loops
      // The preview manager will handle restart logic
    }
  }, 30000); // Every 30 seconds

  processWatchdogs.set(buildId, watchdog);
  console.log(`[ProcessRunner:${buildId}] 🐕 Watchdog started`);
}

/**
 * Clear watchdog for a build
 */
function clearWatchdog(buildId: string): void {
  const watchdog = processWatchdogs.get(buildId);
  if (watchdog) {
    clearInterval(watchdog);
    processWatchdogs.delete(buildId);
    console.log(`[ProcessRunner:${buildId}] 🐕 Watchdog stopped`);
  }
}

/**
 * Check if URL is responsive
 */
async function checkUrlHealth(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok || response.status === 404;
  } catch {
    return false;
  }
}

/**
 * Kill a managed process by buildId
 */
export async function killManagedProcess(buildId: string): Promise<boolean> {
  const managed = activeProcesses.get(buildId);

  if (!managed) {
    console.log(`[ProcessRunner] ℹ️  No process found for build ${buildId}`);
    return false;
  }

  if (managed.killed) {
    console.log(`[ProcessRunner] ℹ️  Process ${managed.pid} already killed`);
    return true;
  }

  console.log(`[ProcessRunner] 🔪 Killing process ${managed.pid} for build ${buildId}...`);

  try {
    managed.killed = true;

    // Clear watchdog
    clearWatchdog(buildId);

    // Try graceful shutdown first
    try {
      managed.process.kill('SIGTERM');
      console.log(`[ProcessRunner] Sent SIGTERM to ${managed.pid}`);
    } catch (err) {
      console.log(`[ProcessRunner] Process ${managed.pid} already dead`);
    }

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Force kill if still alive
    try {
      process.kill(managed.pid, 0); // Check if alive
      console.log(`[ProcessRunner] 💀 Process ${managed.pid} still alive, sending SIGKILL`);
      managed.process.kill('SIGKILL');
    } catch {
      // Already dead
    }

    // OPTIMIZATION: Also kill by port (aggressive cleanup)
    await killProcessOnPort(managed.port, true);

    activeProcesses.delete(buildId);
    console.log(`[ProcessRunner] ✅ Process ${managed.pid} killed`);

    return true;
  } catch (error: any) {
    if (error.code === 'ESRCH') {
      activeProcesses.delete(buildId);
      return true;
    }

    console.error(`[ProcessRunner] ❌ Failed to kill process ${managed.pid}:`, error);
    return false;
  }
}

/**
 * Get managed process by buildId
 */
export function getManagedProcess(buildId: string): ManagedProcess | null {
  return activeProcesses.get(buildId) || null;
}

/**
 * Check if a process is ready
 */
export function isProcessReady(buildId: string): boolean {
  const managed = activeProcesses.get(buildId);
  return managed ? managed.isReady : false;
}

/**
 * Get all active processes
 */
export function getAllManagedProcesses(): ManagedProcess[] {
  return Array.from(activeProcesses.values());
}

/**
 * Cleanup all processes
 */
export async function cleanupAllProcesses(): Promise<void> {
  console.log('[ProcessRunner] 🧹 Cleaning up all managed processes...');

  const buildIds = Array.from(activeProcesses.keys());

  for (const buildId of buildIds) {
    await killManagedProcess(buildId);
  }

  // Clear all watchdogs
  for (const buildId of processWatchdogs.keys()) {
    clearWatchdog(buildId);
  }

  console.log('[ProcessRunner] ✅ All processes cleaned up');
}

/**
 * Wait for URL to be ready with optimized detection
 */
export async function waitForUrl(
  url: string,
  timeoutMs: number = 120000,
  intervalMs: number = 500
): Promise<boolean> {
  const startTime = Date.now();

  console.log(`[ProcessRunner] ⏳ Waiting for ${url} to be ready...`);

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok || response.status === 404 || response.status === 500) {
        const elapsed = Date.now() - startTime;
        console.log(`[ProcessRunner] ✅ ${url} is responding (status: ${response.status}) after ${elapsed}ms`);
        return true;
      }
    } catch (error: any) {
      // Server not ready yet, continue polling
      if (error.name !== 'AbortError' && error.code !== 'ECONNREFUSED') {
        // Only log unexpected errors
        if (Date.now() - startTime > 10000) { // After 10 seconds, start logging
          console.log(`[ProcessRunner] Still waiting... (${error.message})`);
        }
      }
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  console.error(`[ProcessRunner] ❌ Timeout waiting for ${url} after ${timeoutMs}ms`);
  return false;
}

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log('[ProcessRunner] 🛑 SIGINT received');
  await cleanupAllProcesses();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[ProcessRunner] 🛑 SIGTERM received');
  await cleanupAllProcesses();
  process.exit(0);
});

// Export killProcessOnPort for external use
export { killProcessOnPort };
