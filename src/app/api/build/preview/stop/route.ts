/**
 * Preview Stop API
 * POST /api/build/preview/stop
 *
 * Stops the preview server for a build.
 *
 * Request body:
 * {
 *   jobId: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   buildId: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { getJob } from '@/lib/builder/BuildOrchestrator';
import { stopPreview } from '../../../../../../server/preview/previewManager';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyUser(request);

    // Parse request body
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required in request body' },
        { status: 400 }
      );
    }

    // Get job and verify ownership
    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.userId !== authUser.uid) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this job' },
        { status: 403 }
      );
    }

    console.log(`[Preview Stop] Stopping preview for job ${jobId}`);

    // Stop the preview server
    const success = await stopPreview(jobId);

    return NextResponse.json({
      success,
      buildId: jobId,
    });

  } catch (error: any) {
    console.error('[Preview Stop] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to stop preview',
        code: 'PREVIEW_STOP_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
