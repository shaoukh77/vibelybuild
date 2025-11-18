/**
 * Build Output API - Output Paths
 * GET /api/build/output?jobId=XYZ
 *
 * Returns output paths and metadata for a completed build.
 *
 * Response:
 * {
 *   jobId: string,
 *   status: string,
 *   appName: string,
 *   outputPath: string,
 *   fileCount: number,
 *   blueprint: AppBlueprint
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { getJob, getGeneratedFiles } from '@/lib/builder/BuildOrchestrator';

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

    // Get file count
    const files = await getGeneratedFiles(jobId);

    return NextResponse.json({
      jobId: job.jobId,
      status: job.status,
      appName: job.blueprint?.appName || 'Generated App',
      outputPath: job.outputPath,
      fileCount: files.length,
      blueprint: job.blueprint,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
    });

  } catch (error: any) {
    console.error('[Build Output] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to get build output',
        code: 'OUTPUT_ERROR',
      },
      { status: 500 }
    );
  }
}
