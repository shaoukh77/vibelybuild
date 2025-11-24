/**
 * Preview Restart API (Serverless)
 * POST /api/build/preview/restart
 *
 * For serverless previews, "restart" just means getting the current preview URL.
 * Previews are stateless and regenerated on each request.
 *
 * Request body:
 * {
 *   jobId: string
 * }
 *
 * Response:
 * {
 *   buildId: string,
 *   url: string | null,
 *   status: "ready" | "error"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { getJob } from '@/lib/builder/BuildOrchestrator';

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

    // For serverless, just return the preview URL if build is complete
    if (job.status === 'complete') {
      return NextResponse.json({
        buildId: jobId,
        url: `/api/preview/${jobId}`,
        status: 'ready',
      });
    } else {
      return NextResponse.json({
        buildId: jobId,
        url: null,
        status: 'error',
        error: `Build is ${job.status}`,
      });
    }

  } catch (error: any) {
    console.error('[Preview Restart] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to restart preview',
        code: 'PREVIEW_RESTART_ERROR',
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
