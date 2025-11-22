/**
 * Publish API Route
 *
 * Handles publishing built apps to production
 * POST /api/publish
 */

import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { verifyAuthToken } from '@/lib/firebase-admin';
import { savePublishedApp, getPublishedApp } from '@/lib/firestore';
import { uploadToCloudflare } from '@/lib/cloudflareUploader';

const execAsync = promisify(exec);

interface PublishRequest {
  jobId: string;
  userId: string;
  title?: string;
  description?: string;
}

interface BuildLog {
  timestamp: number;
  message: string;
  level: 'info' | 'error' | 'success';
}

/**
 * PHASE 6: Safety check - verify build exists and is complete
 */
async function checkBuildExists(buildPath: string): Promise<boolean> {
  try {
    await fs.access(buildPath);

    // Check for essential Next.js files
    const packageJsonPath = path.join(buildPath, 'package.json');
    const appDirPath = path.join(buildPath, 'app');

    await fs.access(packageJsonPath);
    await fs.access(appDirPath);

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Run npm install if node_modules doesn't exist
 */
async function ensureDependencies(buildPath: string, logs: BuildLog[]): Promise<void> {
  const nodeModulesPath = path.join(buildPath, 'node_modules');

  try {
    await fs.access(nodeModulesPath);
    logs.push({
      timestamp: Date.now(),
      message: '✓ Dependencies already installed',
      level: 'info',
    });
  } catch {
    logs.push({
      timestamp: Date.now(),
      message: 'Installing dependencies...',
      level: 'info',
    });

    try {
      const { stdout, stderr } = await execAsync(
        'npm install --legacy-peer-deps --prefer-offline --loglevel=error',
        {
          cwd: buildPath,
          timeout: 180000, // 3 minutes
        }
      );

      logs.push({
        timestamp: Date.now(),
        message: '✓ Dependencies installed successfully',
        level: 'success',
      });

      if (stderr && !stderr.includes('npm WARN')) {
        logs.push({
          timestamp: Date.now(),
          message: `Warnings: ${stderr}`,
          level: 'info',
        });
      }
    } catch (error: any) {
      logs.push({
        timestamp: Date.now(),
        message: `✗ Failed to install dependencies: ${error.message}`,
        level: 'error',
      });
      throw new Error(`npm install failed: ${error.message}`);
    }
  }
}

/**
 * Run production build
 */
async function runProductionBuild(buildPath: string, logs: BuildLog[]): Promise<void> {
  logs.push({
    timestamp: Date.now(),
    message: 'Running production build...',
    level: 'info',
  });

  try {
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: buildPath,
      timeout: 300000, // 5 minutes
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    });

    // Parse stdout for build info
    if (stdout) {
      const lines = stdout.split('\n').filter(line =>
        line.includes('Route') ||
        line.includes('Size') ||
        line.includes('Compiled') ||
        line.includes('✓')
      );

      lines.forEach(line => {
        if (line.trim()) {
          logs.push({
            timestamp: Date.now(),
            message: line.trim(),
            level: 'info',
          });
        }
      });
    }

    logs.push({
      timestamp: Date.now(),
      message: '✓ Production build completed successfully',
      level: 'success',
    });

    // Check if .next folder exists
    const nextBuildPath = path.join(buildPath, '.next');
    await fs.access(nextBuildPath);

    logs.push({
      timestamp: Date.now(),
      message: '✓ Build artifacts verified',
      level: 'success',
    });
  } catch (error: any) {
    logs.push({
      timestamp: Date.now(),
      message: `✗ Build failed: ${error.message}`,
      level: 'error',
    });

    if (error.stdout) {
      logs.push({
        timestamp: Date.now(),
        message: error.stdout,
        level: 'info',
      });
    }

    if (error.stderr) {
      logs.push({
        timestamp: Date.now(),
        message: error.stderr,
        level: 'error',
      });
    }

    throw new Error(`Production build failed: ${error.message}`);
  }
}

/**
 * Main publish handler
 */
export async function POST(request: NextRequest) {
  const logs: BuildLog[] = [];

  try {
    // Parse request body
    const body: PublishRequest = await request.json();
    const { jobId, userId, title, description } = body;

    if (!jobId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId or userId' },
        { status: 400 }
      );
    }

    logs.push({
      timestamp: Date.now(),
      message: `Starting publish for job ${jobId}`,
      level: 'info',
    });

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const decodedToken = await verifyAuthToken(token);

      // Verify user owns this build
      if (decodedToken.uid !== userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: User ID mismatch' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // PHASE 6: Check if already published
    try {
      const existingApp = await getPublishedApp(jobId);
      if (existingApp) {
        logs.push({
          timestamp: Date.now(),
          message: 'App already published. Creating new version...',
          level: 'info',
        });
      }
    } catch (error) {
      // App not published yet, continue
    }

    // Locate generated app
    const buildPath = path.join(
      process.cwd(),
      '.cache',
      'vibecode',
      jobId,
      'generated'
    );

    logs.push({
      timestamp: Date.now(),
      message: `Located build at: ${buildPath}`,
      level: 'info',
    });

    // PHASE 6: Safety check - verify build exists
    const buildExists = await checkBuildExists(buildPath);

    if (!buildExists) {
      logs.push({
        timestamp: Date.now(),
        message: '✗ Build not found or incomplete',
        level: 'error',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Build not found. Please complete the build first.',
          logs,
        },
        { status: 404 }
      );
    }

    logs.push({
      timestamp: Date.now(),
      message: '✓ Build found and verified',
      level: 'success',
    });

    // Step 1: Ensure dependencies
    await ensureDependencies(buildPath, logs);

    // Step 2: Run production build
    await runProductionBuild(buildPath, logs);

    // Step 3: Upload to Cloudflare Pages
    logs.push({
      timestamp: Date.now(),
      message: 'Uploading to Cloudflare Pages...',
      level: 'info',
    });

    const uploadResult = await uploadToCloudflare(buildPath, jobId);

    logs.push({
      timestamp: Date.now(),
      message: `✓ Deployed to: ${uploadResult.url}`,
      level: 'success',
    });

    // Step 4: Save to Firestore
    const publishData = {
      jobId,
      userId,
      url: uploadResult.url,
      title: title || `App ${jobId.substring(0, 8)}`,
      description: description || 'Built with VibeBuild AI',
      publishStatus: 'published' as const,
      timestamp: Date.now(),
      buildPath,
      deploymentId: uploadResult.deploymentId || jobId,
    };

    await savePublishedApp(publishData);

    logs.push({
      timestamp: Date.now(),
      message: '✓ Saved to database',
      level: 'success',
    });

    logs.push({
      timestamp: Date.now(),
      message: '✓ Publish complete!',
      level: 'success',
    });

    // Return success
    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      logs,
      publishData: {
        jobId,
        url: uploadResult.url,
        title: publishData.title,
        description: publishData.description,
        timestamp: publishData.timestamp,
      },
    });
  } catch (error: any) {
    console.error('[Publish API] Error:', error);

    logs.push({
      timestamp: Date.now(),
      message: `✗ Publish failed: ${error.message}`,
      level: 'error',
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to publish app',
        logs,
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - check publish status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId' },
        { status: 400 }
      );
    }

    const publishedApp = await getPublishedApp(jobId);

    if (!publishedApp) {
      return NextResponse.json(
        { success: false, error: 'App not published yet' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      publishedApp,
    });
  } catch (error: any) {
    console.error('[Publish API GET] Error:', error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
