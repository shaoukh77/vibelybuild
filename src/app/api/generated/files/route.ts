/**
 * Generated Files API - File Tree
 * GET /api/generated/files?jobId=XYZ
 *
 * Returns the file tree of generated code for a completed build.
 *
 * Response:
 * {
 *   jobId: string,
 *   files: string[],  // Array of relative file paths
 *   structure: FileNode  // Tree structure for UI display
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { getJob, getGeneratedFiles } from '@/lib/builder/BuildOrchestrator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
}

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

    if (job.status !== 'complete') {
      return NextResponse.json(
        { error: 'Build is not complete yet', status: job.status },
        { status: 400 }
      );
    }

    // Get file list
    const files = await getGeneratedFiles(jobId);

    // Build tree structure
    const structure = buildFileTree(files);

    return NextResponse.json({
      jobId,
      files,
      structure,
      totalFiles: files.length,
    });

  } catch (error: any) {
    console.error('[Generated Files] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to get file list',
        code: 'FILES_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Build hierarchical file tree from flat file list
 */
function buildFileTree(files: string[]): FileNode {
  const root: FileNode = {
    name: 'root',
    type: 'folder',
    path: '',
    children: [],
  };

  for (const file of files) {
    const parts = file.split(/[/\\]/);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const pathSoFar = parts.slice(0, i + 1).join('/');

      let existing = current.children?.find((c) => c.name === part);

      if (!existing) {
        existing = {
          name: part,
          type: isLast ? 'file' : 'folder',
          path: pathSoFar,
          children: isLast ? undefined : [],
        };
        current.children = current.children || [];
        current.children.push(existing);
      }

      if (!isLast) {
        current = existing;
      }
    }
  }

  return root;
}
