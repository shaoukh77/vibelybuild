/**
 * Generated File API - File Content
 * GET /api/generated/file?jobId=XYZ&path=src/app/page.tsx
 *
 * Returns the content of a specific generated file.
 *
 * Response:
 * {
 *   jobId: string,
 *   path: string,
 *   content: string,
 *   language: string  // For syntax highlighting
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { getJob, getFileContent } from '@/lib/builder/BuildOrchestrator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyUser(request);

    // Get params from query
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const filePath = searchParams.get('path');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId query parameter is required' },
        { status: 400 }
      );
    }

    if (!filePath) {
      return NextResponse.json(
        { error: 'path query parameter is required' },
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

    if (job.status !== 'complete') {
      return NextResponse.json(
        { error: 'Build is not complete yet', status: job.status },
        { status: 400 }
      );
    }

    // Get file content
    const content = await getFileContent(jobId, filePath);

    // Detect language for syntax highlighting
    const language = detectLanguage(filePath);

    return NextResponse.json({
      jobId,
      path: filePath,
      content,
      language,
    });

  } catch (error: any) {
    console.error('[Generated File] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to get file content',
        code: 'FILE_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Detect programming language from file extension
 */
function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';

  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'json': 'json',
    'css': 'css',
    'scss': 'scss',
    'html': 'html',
    'md': 'markdown',
    'yml': 'yaml',
    'yaml': 'yaml',
    'sh': 'bash',
  };

  return languageMap[ext] || 'plaintext';
}
