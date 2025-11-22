/**
 * Run Process - Spawn and manage long-running child processes
 */

import { spawn, ChildProcess } from 'child_process';

export interface SpawnedProcess {
  process: ChildProcess;
  pid: number;
  command: string;
  args: string[];
  cwd: string;
  startTime: number;
}

/**
 * Spawn a long-running process
 */
export function spawnProcess(
  command: string,
  args: string[],
  cwd: string,
  onOutput?: (data: string) => void,
  onError?: (data: string) => void
): SpawnedProcess {
  console.log(`[RunProcess] 🚀 Spawning: ${command} ${args.join(' ')} in ${cwd}`);

  const child = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    detached: false,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: args.includes('--port') ? args[args.indexOf('--port') + 1] : '3000',
    },
  });

  if (!child.pid) {
    throw new Error('Failed to spawn process - no PID assigned');
  }

  // Capture stdout
  if (child.stdout) {
    child.stdout.on('data', (data: Buffer) => {
      const output = data.toString();
      if (onOutput) {
        onOutput(output);
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
    });
  }

  // Handle process events
  child.on('exit', (code, signal) => {
    console.log(`[RunProcess] 📊 Process ${child.pid} exited with code ${code}, signal ${signal}`);
  });

  child.on('error', (error) => {
    console.error(`[RunProcess] ❌ Process ${child.pid} error:`, error);
  });

  console.log(`[RunProcess] ✅ Spawned process with PID: ${child.pid}`);

  return {
    process: child,
    pid: child.pid,
    command,
    args,
    cwd,
    startTime: Date.now(),
  };
}

/**
 * Kill a process by PID
 */
export async function killProcess(pid: number): Promise<boolean> {
  try {
    console.log(`[RunProcess] 🔪 Killing process ${pid}...`);

    // Try SIGTERM first (graceful)
    process.kill(pid, 'SIGTERM');

    // Wait 2 seconds for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if still alive
    try {
      process.kill(pid, 0); // Signal 0 checks existence without killing
      console.log(`[RunProcess] 💀 Process ${pid} still alive, sending SIGKILL`);
      process.kill(pid, 'SIGKILL');
    } catch {
      // Process is already dead
      console.log(`[RunProcess] ✅ Process ${pid} killed successfully`);
      return true;
    }

    return true;
  } catch (error: any) {
    if (error.code === 'ESRCH') {
      // Process doesn't exist (already dead)
      console.log(`[RunProcess] ℹ️  Process ${pid} does not exist`);
      return true;
    }

    console.error(`[RunProcess] ❌ Failed to kill process ${pid}:`, error);
    return false;
  }
}

/**
 * Check if a process is still running
 */
export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0); // Signal 0 checks without killing
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for a URL to become available (polling)
 */
export async function waitForUrl(
  url: string,
  timeoutMs: number = 60000,
  intervalMs: number = 500
): Promise<boolean> {
  const startTime = Date.now();

  console.log(`[RunProcess] ⏳ Waiting for ${url} to be ready...`);

  while (Date.now() - startTime < timeoutMs) {
    try {
      // Try to fetch the URL
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });

      if (response.ok || response.status === 404) {
        // Server is responding (404 is fine, means server is up)
        console.log(`[RunProcess] ✅ ${url} is ready!`);
        return true;
      }
    } catch (error) {
      // Server not ready yet, continue polling
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  console.error(`[RunProcess] ❌ Timeout waiting for ${url} after ${timeoutMs}ms`);
  return false;
}

/**
 * Kill all processes on a specific port (cleanup utility)
 */
export async function killProcessOnPort(port: number): Promise<void> {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Use lsof to find processes on the port
    const { stdout } = await execAsync(`lsof -ti:${port} || true`);
    const pids = stdout.trim().split('\n').filter(Boolean);

    for (const pidStr of pids) {
      const pid = parseInt(pidStr, 10);
      if (!isNaN(pid)) {
        console.log(`[RunProcess] 🔪 Killing process ${pid} on port ${port}`);
        await killProcess(pid);
      }
    }
  } catch (error) {
    console.error(`[RunProcess] ❌ Failed to kill processes on port ${port}:`, error);
  }
}
