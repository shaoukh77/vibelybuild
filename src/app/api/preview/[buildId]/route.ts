/**
 * Preview API Endpoint
 * Returns generated code files for client-side preview
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { db } from '@/lib/firebaseAdmin';
import { generateProjectFromBlueprint } from '@/lib/codegen';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    buildId: string;
  }>;
}

/**
 * GET /api/preview/[buildId]
 * Returns generated files for preview
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

    // Return files for preview
    return NextResponse.json({
      buildId,
      appName: buildData.appName || 'Generated App',
      files: generatedProject.files,
      entryPoint: 'src/app/page.tsx',
      blueprint: buildData.blueprint,
    });
  } catch (error: any) {
    console.error('[Preview API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
