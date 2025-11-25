/**
 * Preview Server Manager
 *
 * Manages temporary Next.js dev servers for live preview of generated apps.
 * Features:
 * - Spawn isolated Next.js dev servers on random ports
 * - Auto-kill on timeout (5 minutes)
 * - Process lifecycle management
 * - Port allocation and tracking
 * - Error handling and recovery
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { getJob } from './BuildOrchestrator';

const MIN_PORT = 5000;
const MAX_PORT = 5999;
const PREVIEW_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const STARTUP_TIMEOUT = 120 * 1000; // 120 seconds to start (includes npm install time)

interface PreviewServer {
  jobId: string;
  process: ChildProcess;
  port: number;
  previewUrl: string;
  startedAt: number;
  timeout: NodeJS.Timeout;
  status: 'starting' | 'ready' | 'failed' | 'stopped';
  error?: string;
}

// Active preview servers
const activeServers = new Map<string, PreviewServer>();
const usedPorts = new Set<number>();

/**
 * Get a random available port
 */
function getRandomPort(): number {
  let attempts = 0;
  while (attempts < 100) {
    const port = Math.floor(Math.random() * (MAX_PORT - MIN_PORT + 1)) + MIN_PORT;
    if (!usedPorts.has(port)) {
      usedPorts.add(port);
      return port;
    }
    attempts++;
  }
  throw new Error('No available ports in range');
}

/**
 * Release a port back to the pool
 */
function releasePort(port: number): void {
  usedPorts.delete(port);
}

/**
 * Start a preview server for a build
 */
export async function startPreviewServer(jobId: string): Promise<{ previewUrl: string; port: number }> {
  // Check if server already running
  const existing = activeServers.get(jobId);
  if (existing) {
    if (existing.status === 'ready') {
      return { previewUrl: existing.previewUrl, port: existing.port };
    } else if (existing.status === 'starting') {
      // Wait for startup
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          const server = activeServers.get(jobId);
          if (server?.status === 'ready') {
            clearInterval(checkInterval);
            resolve({ previewUrl: server.previewUrl, port: server.port });
          } else if (server?.status === 'failed') {
            clearInterval(checkInterval);
            reject(new Error(server.error || 'Server failed to start'));
          }
        }, 500);

        // Timeout after 60 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Server startup timeout'));
        }, STARTUP_TIMEOUT);
      });
    }
  }

  // Verify build exists and is complete
  const job = getJob(jobId);
  if (!job) {
    throw new Error('Build not found');
  }

  if (job.status !== 'complete') {
    throw new Error('Build is not complete yet');
  }

  if (!job.outputPath) {
    throw new Error('Build output path not found');
  }

  // Verify the generated app directory exists
  try {
    await fs.access(job.outputPath);
  } catch (error) {
    throw new Error('Generated app files not found');
  }

  // Check for package.json
  const packageJsonPath = path.join(job.outputPath, 'package.json');
  try {
    await fs.access(packageJsonPath);
  } catch (error) {
    throw new Error('Missing package.json in generated app');
  }

  // Check if node_modules exists, if not, install dependencies
  const nodeModulesPath = path.join(job.outputPath, 'node_modules');
  try {
    await fs.access(nodeModulesPath);
    console.log(`[PreviewServer] Dependencies already installed for ${jobId}`);
  } catch (error) {
    console.log(`[PreviewServer] Installing dependencies for ${jobId}...`);

    // Run npm install
    const installProcess = spawn('npm', ['install'], {
      cwd: job.outputPath,
      stdio: 'inherit',
    });

    await new Promise<void>((resolve, reject) => {
      installProcess.on('exit', (code) => {
        if (code === 0) {
          console.log(`[PreviewServer] Dependencies installed successfully for ${jobId}`);
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });

      installProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Allocate port
  const port = getRandomPort();
  const previewUrl = `http://localhost:${port}`;

  console.log(`[PreviewServer] Starting preview server for build ${jobId} on port ${port}`);
  console.log(`[PreviewServer] App directory: ${job.outputPath}`);

  // Spawn Next.js dev server
  // Use npx to run next dev with the specified port
  const child = spawn('npx', ['next', 'dev', '-p', port.toString(), '-H', '0.0.0.0'], {
    cwd: job.outputPath,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: port.toString(),
    },
  });

  // Create server entry
  const server: PreviewServer = {
    jobId,
    process: child,
    port,
    previewUrl,
    startedAt: Date.now(),
    status: 'starting',
    timeout: setTimeout(() => {
      console.log(`[PreviewServer] Timeout reached for ${jobId}, stopping server`);
      stopPreviewServer(jobId);
    }, PREVIEW_TIMEOUT),
  };

  activeServers.set(jobId, server);

  // Handle process output
  let isReady = false;
  let startupTimeout: NodeJS.Timeout | null = null;

  return new Promise((resolve, reject) => {
    // Listen for stdout to detect when server is ready
    child.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log(`[PreviewServer ${jobId}] ${output}`);

      // Check for Next.js ready messages
      if (output.includes('Ready') || output.includes('started server') || output.includes(`localhost:${port}`)) {
        if (!isReady) {
          isReady = true;
          server.status = 'ready';

          if (startupTimeout) {
            clearTimeout(startupTimeout);
          }

          console.log(`[PreviewServer] Server ready for ${jobId} at ${previewUrl}`);
          resolve({ previewUrl, port });
        }
      }
    });

    // Listen for stderr
    child.stderr?.on('data', (data: Buffer) => {
      const error = data.toString();
      console.error(`[PreviewServer ${jobId}] Error: ${error}`);

      // Check for port already in use
      if (error.includes('EADDRINUSE') || error.includes('address already in use')) {
        server.status = 'failed';
        server.error = 'Port already in use';
        stopPreviewServer(jobId);
        reject(new Error('Port already in use. Please try again.'));
      }
    });

    // Handle process exit
    child.on('exit', (code, signal) => {
      console.log(`[PreviewServer] Process exited for ${jobId}, code: ${code}, signal: ${signal}`);

      if (!isReady) {
        server.status = 'failed';
        server.error = `Process exited with code ${code}`;
        reject(new Error(server.error));
      }

      // Cleanup
      activeServers.delete(jobId);
      releasePort(port);
    });

    // Handle process errors
    child.on('error', (error) => {
      console.error(`[PreviewServer] Process error for ${jobId}:`, error);
      server.status = 'failed';
      server.error = error.message;

      if (!isReady) {
        reject(error);
      }

      stopPreviewServer(jobId);
    });

    // Set startup timeout
    startupTimeout = setTimeout(() => {
      if (!isReady) {
        server.status = 'failed';
        server.error = 'Server failed to start within 60 seconds';
        console.error(`[PreviewServer] Startup timeout for ${jobId}`);
        stopPreviewServer(jobId);
        reject(new Error('Server startup timeout'));
      }
    }, STARTUP_TIMEOUT);
  });
}

/**
 * Stop a preview server
 */
export function stopPreviewServer(jobId: string): boolean {
  const server = activeServers.get(jobId);

  if (!server) {
    return false;
  }

  console.log(`[PreviewServer] Stopping server for ${jobId}`);

  // Clear timeout
  if (server.timeout) {
    clearTimeout(server.timeout);
  }

  // Kill process
  try {
    if (server.process && !server.process.killed) {
      server.process.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (server.process && !server.process.killed) {
          console.log(`[PreviewServer] Force killing process for ${jobId}`);
          server.process.kill('SIGKILL');
        }
      }, 5000);
    }
  } catch (error) {
    console.error(`[PreviewServer] Error killing process for ${jobId}:`, error);
  }

  // Cleanup
  server.status = 'stopped';
  activeServers.delete(jobId);
  releasePort(server.port);

  return true;
}

/**
 * Get preview server info
 */
export function getPreviewServer(jobId: string): PreviewServer | null {
  return activeServers.get(jobId) || null;
}

/**
 * Stop all preview servers
 */
export function stopAllPreviewServers(): void {
  console.log(`[PreviewServer] Stopping all preview servers (${activeServers.size} active)`);

  for (const [jobId] of activeServers) {
    stopPreviewServer(jobId);
  }
}

/**
 * Get all active servers
 */
export function getAllActiveServers(): Map<string, PreviewServer> {
  return new Map(activeServers);
}

/**
 * Cleanup old servers (can be called periodically)
 */
export function cleanupStaleServers(): void {
  const now = Date.now();
  const staleThreshold = PREVIEW_TIMEOUT;

  for (const [jobId, server] of activeServers) {
    if (now - server.startedAt > staleThreshold) {
      console.log(`[PreviewServer] Cleaning up stale server for ${jobId}`);
      stopPreviewServer(jobId);
    }
  }
}

// Cleanup on process exit
process.on('SIGINT', () => {
  console.log('[PreviewServer] Received SIGINT, stopping all servers');
  stopAllPreviewServers();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[PreviewServer] Received SIGTERM, stopping all servers');
  stopAllPreviewServers();
  process.exit(0);
});
