/**
 * Download API Endpoint
 * Returns generated code as a ZIP file
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { db } from '@/lib/firebaseAdmin';
import { generateProjectFromBlueprint } from '@/lib/codegen';
import archiver from 'archiver';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    buildId: string;
  }>;
}

/**
 * GET /api/download/[buildId]
 * Returns generated project as a ZIP file
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify user authentication
    const authUser = await verifyUser(request);
    const { buildId } = await params;

    if (!buildId) {
      return NextResponse.json(
        { error: 'Build ID required' },
        { status: 400 }
      );
    }

    // Get build from Firestore
    const buildRef = db.collection('builds').doc(buildId);
    const buildSnap = await buildRef.get();

    if (!buildSnap.exists) {
      return NextResponse.json(
        { error: 'Build not found' },
        { status: 404 }
      );
    }

    const buildData = buildSnap.data();

    // Verify ownership
    if (buildData?.userId !== authUser.uid) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this build' },
        { status: 403 }
      );
    }

    // Check if build is complete
    if (buildData.status !== 'complete') {
      return NextResponse.json(
        { error: 'Build is not complete yet', status: buildData.status },
        { status: 400 }
      );
    }

    // Check if blueprint exists
    if (!buildData.blueprint) {
      return NextResponse.json(
        { error: 'Blueprint not found for this build' },
        { status: 404 }
      );
    }

    // Generate project files from blueprint
    const generatedProject = generateProjectFromBlueprint(
      buildId,
      buildData.blueprint
    );

    const appName = buildData.appName || 'generated-app';
    const folderName = `${appName.toLowerCase().replace(/\s+/g, '-')}-${buildId.substring(0, 8)}`;

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Collect chunks
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Add files to archive
    for (const [filePath, content] of Object.entries(generatedProject.files)) {
      archive.append(content, { name: `${folderName}/${filePath}` });
    }

    // Finalize archive
    await archive.finalize();

    // Wait for archive to finish
    await new Promise((resolve, reject) => {
      archive.on('end', resolve);
      archive.on('error', reject);
    });

    // Combine chunks
    const zipBuffer = Buffer.concat(chunks);

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${folderName}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('[Download API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate download' },
      { status: 500 }
    );
  }
}
