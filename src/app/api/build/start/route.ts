/**
 * Build Start API - Trigger New Build Job
 * POST /api/build/start
 *
 * Creates a new build job and starts the build pipeline asynchronously.
 * Returns jobId immediately for log streaming.
 *
 * Request body:
 * {
 *   prompt: string,
 *   target?: "web" | "ios" | "android" | "multi"
 * }
 *
 * Response:
 * {
 *   success: true,
 *   jobId: string,
 *   status: "queued"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { createBuildJob, executeBuild } from '@/lib/builder/BuildOrchestrator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyUser(request);

    // Parse request body
    const body = await request.json();
    const { prompt, target = 'web' } = body;

    // Validation
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!['web', 'ios', 'android', 'multi'].includes(target)) {
      return NextResponse.json(
        { error: 'Invalid target. Must be: web, ios, android, or multi' },
        { status: 400 }
      );
    }

    // Create build job
    const job = await createBuildJob(authUser.uid, prompt.trim(), target);

    // Start build asynchronously (don't await)
    executeBuild(job.jobId).catch((error) => {
      console.error(`[Build Start] Build ${job.jobId} failed:`, error);
    });

    // Return immediately
    return NextResponse.json({
      success: true,
      jobId: job.jobId,
      status: job.status,
    });

  } catch (error: any) {
    console.error('[Build Start] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to start build',
        code: 'BUILD_START_ERROR',
      },
      { status: 500 }
    );
  }
}
