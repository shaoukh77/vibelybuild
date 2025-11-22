/**
 * Preview Status API
 * GET /api/build/preview?jobId=XYZ
 *
 * Returns the current status and URL of a preview server.
 *
 * Response:
 * {
 *   buildId: string,
 *   url: string | null,
 *   status: "starting" | "ready" | "error" | "not_found",
 *   port?: number,
 *   startTime?: number,
 *   error?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { getJob } from '@/lib/builder/BuildOrchestrator';
import { getPreview } from '../../../../../server/preview/previewManager';

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

    // Get preview server info
    const previewInfo = getPreview(jobId);

    if (!previewInfo) {
      return NextResponse.json({
        buildId: jobId,
        url: null,
        status: 'not_found',
        error: 'Preview server not started',
      });
    }

    return NextResponse.json({
      buildId: previewInfo.buildId,
      url: previewInfo.url,
      status: previewInfo.status,
      port: previewInfo.port,
      startTime: previewInfo.startTime,
      error: previewInfo.error,
    });

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
