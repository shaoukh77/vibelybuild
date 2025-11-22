/**
 * Build Delete API - Delete a build
 * DELETE /api/build/delete
 *
 * Deletes a build from Firestore and cleans up local cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { deleteBuildFromFirestore } from '@/lib/builder/saveBuildToFirestore';
import { deleteBuildCache } from '@/lib/builder/BuildOrchestrator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyUser(request);

    // Get projectId from query
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Delete from Firestore
    await deleteBuildFromFirestore(projectId, authUser.uid);

    // Delete local cache (optional - may fail if cache doesn't exist)
    try {
      await deleteBuildCache(projectId);
    } catch (err) {
      console.warn('[Build Delete] Cache cleanup failed (may not exist):', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Build deleted successfully',
    });

  } catch (error: any) {
    console.error('[Build Delete] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to delete build',
        code: 'BUILD_DELETE_ERROR',
      },
      { status: 500 }
    );
  }
}
