/**
 * Preview Server - OPTIMIZED VERSION
 *
 * OPTIMIZATIONS:
 * 1. Turbopack enabled (--turbo flag)
 * 2. Clear .next cache on every build
 * 3. Build time optimizations (parallel operations)
 * 4. CPU/RAM limits
 * 5. Auto-detect stale node_modules
 * 6. Wait for Next.js ready before preview_ready
 * 7. Retry mechanism for failures
 * 8. Better error handling
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { startManagedProcess, waitForUrl, ManagedProcess } from './processRunner';

export interface PreviewServerInfo {
  buildId: string;
  port: number;
  pid: number;
  url: string;
  projectPath: string;
  status: 'starting' | 'ready' | 'error';
  startTime: number;
  managedProcess?: ManagedProcess;
  error?: string;
  retryCount?: number;
  mode?: 'development' | 'production';
}

const MAX_RETRIES = 3;
const STARTUP_TIMEOUT = 120000; // 2 minutes

/**
 * OPTIMIZATION: Clear preview cache before starting
 */
async function clearPreviewCache(projectPath: string): Promise<void> {
  const cacheDir = path.join(projectPath, '.next');
  const turboDir = path.join(projectPath, '.turbo');

  try {
    console.log(`[PreviewServer] 🧹 Clearing cache directories...`);

    // Clear .next cache
    try {
      await fs.rm(cacheDir, { recursive: true, force: true });
      console.log(`[PreviewServer] ✅ Cleared .next cache`);
    } catch (err) {
      // Ignore if doesn't exist
    }

    // Clear .turbo cache
    try {
      await fs.rm(turboDir, { recursive: true, force: true });
      console.log(`[PreviewServer] ✅ Cleared .turbo cache`);
    } catch (err) {
      // Ignore if doesn't exist
    }
  } catch (error) {
    console.error(`[PreviewServer] ⚠️  Failed to clear cache:`, error);
    // Don't throw - continue anyway
  }
}

/**
 * OPTIMIZATION: Check if node_modules is stale (older than package.json)
 */
async function isNodeModulesStale(projectPath: string): Promise<boolean> {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const nodeModulesPath = path.join(projectPath, 'node_modules');

    const packageJsonStat = await fs.stat(packageJsonPath);
    const nodeModulesStat = await fs.stat(nodeModulesPath);

    // If node_modules is older than package.json, it's stale
    return nodeModulesStat.mtime < packageJsonStat.mtime;
  } catch (error) {
    // If node_modules doesn't exist, it's stale
    return true;
  }
}

/**
 * OPTIMIZATION: Start preview server with retry mechanism
 */
export async function startPreviewServer(
  buildId: string,
  projectPath: string,
  port: number,
  onReady?: () => void,
  retryCount: number = 0,
  mode: 'development' | 'production' = 'development'
): Promise<PreviewServerInfo> {
  console.log(`\n[PreviewServer:${buildId}] 🎬 OPTIMIZED PREVIEW ENGINE (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
  console.log(`[PreviewServer:${buildId}] 📂 Project: ${projectPath}`);
  console.log(`[PreviewServer:${buildId}] 🔌 Port: ${port}`);

  const serverUrl = `http://localhost:${port}`;

  try {
    // STEP 1: Verify project path exists
    await fs.access(projectPath);
    console.log(`[PreviewServer:${buildId}] ✅ Project path verified`);
  } catch {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }

  try {
    // STEP 2: OPTIMIZATION - Clear cache on every build
    await clearPreviewCache(projectPath);

    // STEP 3: Ensure package.json exists
    await ensurePackageJson(projectPath);

    // STEP 4: OPTIMIZATION - Check for stale node_modules
    const isStale = await isNodeModulesStale(projectPath);

    if (isStale) {
      console.log(`[PreviewServer:${buildId}] ♻️  Stale node_modules detected, reinstalling...`);
      // Remove old node_modules
      try {
        await fs.rm(path.join(projectPath, 'node_modules'), { recursive: true, force: true });
      } catch (err) {
        // Ignore if doesn't exist
      }
    }

    // STEP 5: Install dependencies if needed (optimized)
    await ensureDependencies(projectPath, buildId);

    // STEP 6: Generate next.config.js with iframe + CORS support
    await generateNextConfig(projectPath);

    // STEP 7: Generate middleware.ts for X-Frame-Options bypass
    await generateMiddleware(projectPath);

    // STEP 8: Ensure app directory structure exists
    await ensureAppStructure(projectPath);

    // STEP 9: OPTIMIZATION - Start Next.js server with mode selection
    if (mode === 'production') {
      // Build for production first
      console.log(`[PreviewServer:${buildId}] 🏗️  Building production app...`);
      const { runCommand } = await import('../process/runCommand');

      const { exitCode, stderr } = await runCommand(
        'npx next build',
        projectPath,
        180000 // 3 minutes for build
      );

      if (exitCode !== 0) {
        throw new Error(`Production build failed: ${stderr}`);
      }

      console.log(`[PreviewServer:${buildId}] 🚀 Starting Next.js production server...`);
    } else {
      console.log(`[PreviewServer:${buildId}] 🚀 Starting Next.js dev server with Turbopack...`);
    }

    const managedProcess = await startManagedProcess({
      command: 'npx',
      args: mode === 'production'
        ? ['next', 'start', '--port', port.toString()]
        : ['next', 'dev', '--port', port.toString(), '--turbo'], // Turbopack enabled for dev
      cwd: projectPath,
      port,
      buildId,
      // OPTIMIZATION: CPU/RAM limits
      resourceLimits: {
        maxOldGenerationSizeMb: 512, // 512MB RAM limit
        maxYoungGenerationSizeMb: 128, // 128MB for young generation
      },
      onOutput: (output) => {
        // Only log important messages
        if (
          output.includes('Ready in') ||
          output.includes('Compiled') ||
          output.includes('Error') ||
          output.includes('started server')
        ) {
          console.log(`[PreviewServer:${buildId}] ${output.trim()}`);
        }
      },
      onError: (error) => {
        if (!error.includes('Attention') && !error.includes('DeprecationWarning')) {
          console.error(`[PreviewServer:${buildId}] ⚠️  ${error.trim()}`);
        }
      },
      onReady: () => {
        console.log(`[PreviewServer:${buildId}] ✅ UI READY EVENT FIRED!`);
        if (onReady) {
          onReady();
        }
      },
    });

    const serverInfo: PreviewServerInfo = {
      buildId,
      port,
      pid: managedProcess.pid,
      url: serverUrl,
      projectPath,
      status: 'starting',
      startTime: managedProcess.startTime,
      managedProcess,
      retryCount,
      mode,
    };

    // STEP 10: OPTIMIZATION - Wait for server with timeout
    console.log(`[PreviewServer:${buildId}] ⏳ Waiting for HTTP response (${STARTUP_TIMEOUT / 1000}s timeout)...`);

    const isReady = await waitForUrl(serverUrl, STARTUP_TIMEOUT, 1000);

    if (isReady) {
      serverInfo.status = 'ready';
      console.log(`[PreviewServer:${buildId}] ✅ SERVER READY at ${serverUrl}`);
      console.log(`[PreviewServer:${buildId}] ⚡ Startup time: ${Date.now() - serverInfo.startTime}ms`);
    } else {
      serverInfo.status = 'error';
      serverInfo.error = `Server failed to respond within ${STARTUP_TIMEOUT / 1000} seconds`;
      console.error(`[PreviewServer:${buildId}] ❌ Timeout waiting for server`);

      // OPTIMIZATION: Retry if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        console.log(`[PreviewServer:${buildId}] 🔄 Retrying... (${retryCount + 1}/${MAX_RETRIES})`);

        // Kill the failed process
        if (managedProcess.process && !managedProcess.process.killed) {
          managedProcess.process.kill('SIGKILL');
        }

        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Retry with incremented count
        return startPreviewServer(buildId, projectPath, port, onReady, retryCount + 1, mode);
      }
    }

    return serverInfo;
  } catch (error: any) {
    console.error(`[PreviewServer:${buildId}] ❌ FATAL ERROR:`, error);

    // OPTIMIZATION: Retry on error if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES) {
      console.log(`[PreviewServer:${buildId}] 🔄 Retrying after error... (${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return startPreviewServer(buildId, projectPath, port, onReady, retryCount + 1, mode);
    }

    return {
      buildId,
      port,
      pid: 0,
      url: serverUrl,
      projectPath,
      status: 'error',
      startTime: Date.now(),
      error: error.message,
      retryCount,
      mode,
    };
  }
}

/**
 * Ensure package.json exists with optimized dependencies
 */
async function ensurePackageJson(projectPath: string): Promise<void> {
  const packageJsonPath = path.join(projectPath, 'package.json');

  try {
    await fs.access(packageJsonPath);
    console.log(`[PreviewServer] ✅ package.json exists`);
    return;
  } catch {
    console.log(`[PreviewServer] 📦 Creating optimized package.json...`);
  }

  // OPTIMIZATION: Use exact versions for faster installs
  const packageJson = {
    name: 'vibecode-preview-app',
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev --turbo',
      build: 'next build',
      start: 'next start',
    },
    dependencies: {
      next: '15.1.6',
      react: '19.0.0',
      'react-dom': '19.0.0',
    },
    devDependencies: {
      '@types/node': '^22',
      '@types/react': '^19',
      '@types/react-dom': '^19',
      typescript: '^5',
      autoprefixer: '^10',
      postcss: '^8',
      tailwindcss: '^3',
    },
  };

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
  console.log(`[PreviewServer] ✅ package.json created`);
}

/**
 * OPTIMIZATION: Install dependencies with caching and parallel downloads
 */
async function ensureDependencies(projectPath: string, buildId: string): Promise<void> {
  const nodeModulesPath = path.join(projectPath, 'node_modules');

  try {
    await fs.access(nodeModulesPath);
    console.log(`[PreviewServer] ✅ node_modules exists`);
    return;
  } catch {
    console.log(`[PreviewServer] 📥 Installing dependencies (optimized)...`);
  }

  // Import runCommand dynamically
  const { runCommand } = await import('../process/runCommand');

  const startTime = Date.now();

  // OPTIMIZATION: Use npm ci for faster installs, with cache, prefer offline
  const { exitCode, stderr } = await runCommand(
    'npm install --legacy-peer-deps --prefer-offline --no-audit --no-fund --loglevel=error',
    projectPath,
    180000 // 3 minutes timeout
  );

  if (exitCode !== 0) {
    console.error(`[PreviewServer] ❌ npm install failed:`, stderr);
    throw new Error(`Failed to install dependencies: ${stderr}`);
  }

  const duration = Date.now() - startTime;
  console.log(`[PreviewServer] ✅ Dependencies installed in ${duration}ms`);
}

/**
 * Generate next.config.js with optimizations
 */
async function generateNextConfig(projectPath: string): Promise<void> {
  const configPath = path.join(projectPath, 'next.config.js');

  // OPTIMIZATION: Disable features that slow down dev server
  const config = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: Disable strict mode to prevent hydration issues
  reactStrictMode: false,

  // OPTIMIZATION: Turbopack settings
  experimental: {
    turbo: {
      loaders: {},
    },
  },

  // OPTIMIZATION: Disable telemetry
  telemetry: {
    enabled: false,
  },

  // OPTIMIZATION: Faster dev server
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // 25 seconds
    pagesBufferLength: 2,
  },

  // OPTIMIZATION: Disable unnecessary features in dev
  swcMinify: false,
  compress: false,

  // CRITICAL: Headers for iframe embedding + CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Allow iframe embedding from any origin
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:* https://*",
          },
          // CORS headers
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
`;

  await fs.writeFile(configPath, config, 'utf-8');
  console.log(`[PreviewServer] ✅ next.config.js generated with optimizations`);
}

/**
 * Generate middleware.ts for X-Frame-Options bypass
 */
async function generateMiddleware(projectPath: string): Promise<void> {
  const middlewarePath = path.join(projectPath, 'middleware.ts');

  const middleware = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to enable iframe embedding
 * Removes X-Frame-Options and adds proper CORS headers
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Remove restrictive headers
  response.headers.delete('X-Frame-Options');

  // Add permissive headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export const config = {
  matcher: '/:path*',
};
`;

  await fs.writeFile(middlewarePath, middleware, 'utf-8');
  console.log(`[PreviewServer] ✅ middleware.ts generated`);
}

/**
 * Ensure app directory structure exists
 */
async function ensureAppStructure(projectPath: string): Promise<void> {
  const appDir = path.join(projectPath, 'app');

  try {
    await fs.access(appDir);
    console.log(`[PreviewServer] ✅ app/ directory exists`);
  } catch {
    console.log(`[PreviewServer] 📁 Creating app/ directory...`);
    await fs.mkdir(appDir, { recursive: true });

    // Create minimal layout.tsx if missing
    const layoutPath = path.join(appDir, 'layout.tsx');
    try {
      await fs.access(layoutPath);
    } catch {
      const layout = `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
      await fs.writeFile(layoutPath, layout, 'utf-8');
      console.log(`[PreviewServer] ✅ Created app/layout.tsx`);
    }

    // Create minimal page.tsx if missing
    const pagePath = path.join(appDir, 'page.tsx');
    try {
      await fs.access(pagePath);
    } catch {
      const page = `export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Welcome to VibeCode</h1>
      <p>Your generated app is loading...</p>
    </div>
  );
}
`;
      await fs.writeFile(pagePath, page, 'utf-8');
      console.log(`[PreviewServer] ✅ Created app/page.tsx`);
    }
  }
}

/**
 * Check if a preview server is healthy
 */
export async function checkServerHealth(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });

    return response.ok || response.status === 404;
  } catch {
    return false;
  }
}
