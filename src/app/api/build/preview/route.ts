/**
 * Preview Status API
 * GET /api/build/preview?jobId=XYZ
 *
 * Returns the URL and status of a serverless preview.
 *
 * Response:
 * {
 *   buildId: string,
 *   url: string | null,
 *   status: "ready" | "building" | "error" | "not_found",
 *   error?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { getJob } from '@/lib/builder/BuildOrchestrator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyUser(request);

    // Get jobId from query params
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId query parameter is required' },
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

    // Check build status
    if (job.status === 'complete') {
      // Build is complete, preview is available at serverless endpoint
      const previewUrl = `/api/preview/${jobId}`;

      return NextResponse.json({
        buildId: jobId,
        url: previewUrl,
        status: 'ready',
      });
    } else if (job.status === 'failed' || job.status === 'cancelled') {
      return NextResponse.json({
        buildId: jobId,
        url: null,
        status: 'error',
        error: job.error || `Build ${job.status}`,
      });
    } else {
      // Build is still in progress
      return NextResponse.json({
        buildId: jobId,
        url: null,
        status: 'building',
      });
    }

  } catch (error: any) {
    console.error('[Preview API] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to get preview status',
        code: 'PREVIEW_STATUS_ERROR',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
