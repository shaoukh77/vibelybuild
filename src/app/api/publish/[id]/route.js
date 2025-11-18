import { adminDb } from '@/lib/firebaseAdmin';
import admin from '@/lib/firebaseAdmin';
import { verifyAuthWithFallback } from '@/lib/authMiddleware';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/publish/[id] - Publish build to VibeCode Store
 */
export async function POST(req, { params }) {
  try {
    const { id: buildId } = params;

    // Verify authentication
    const authUser = await verifyAuthWithFallback(req);
    const userId = authUser.uid;

    // Get build document
    const buildRef = adminDb.collection('builds').doc(buildId);
    const buildSnap = await buildRef.get();

    if (!buildSnap.exists) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    const buildData = buildSnap.data();

    // Verify ownership
    if (buildData.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this build' },
        { status: 403 }
      );
    }

    // Verify build is complete
    if (buildData.status !== 'complete') {
      return NextResponse.json(
        { error: 'Build must be complete before publishing' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      title,
      description,
      category = 'other',
      tags = [],
      coverUrl = null,
    } = body;

    // Generate app ID
    const { nanoid } = await import('nanoid');
    const appId = `app_${nanoid(16)}`;

    // Create public app document
    const appData = {
      appId,
      buildId,
      ownerId: userId,
      ownerUid: userId,
      ownerEmail: authUser.email,
      ownerName: authUser.name || 'Anonymous',
      title: title || buildData.appName || 'Untitled App',
      description: description || buildData.description || '',
      category,
      tags,
      coverUrl,
      target: buildData.target || 'web',
      techStack: buildData.techStack,
      fileCount: buildData.output?.fileCount || 0,
      status: 'published',
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      views: 0,
      downloads: 0,
      likes: 0,
    };

    await adminDb.collection('publicApps').doc(appId).set(appData);

    // Save to user's apps subcollection
    await adminDb
      .collection('users')
      .doc(userId)
      .collection('apps')
      .doc(appId)
      .set({
        appId,
        buildId,
        title: appData.title,
        status: 'published',
        publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return NextResponse.json({
      success: true,
      appId,
      buildId,
      status: 'published',
      message: 'App published successfully',
    });

  } catch (error) {
    console.error('[Publish API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish app' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/publish/[id] - Update published app
 */
export async function PATCH(req, { params }) {
  try {
    const { id } = params;

    // Verify authentication (supports both Bearer token and custom headers)
    const authUser = await verifyAuthWithFallback(req);
    const userId = authUser.uid;

    // Get the app to verify ownership using Admin SDK
    const appRef = adminDb.collection('publicApps').doc(id);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return new Response(JSON.stringify({ error: 'App not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const appData = appSnap.data();

    // Verify ownership (check both ownerUid and ownerId for backward compatibility)
    if (appData.ownerId !== userId && appData.ownerUid !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized: You do not own this app' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get update data from request
    const body = await req.json();
    const { status } = body;

    // Update the document using Admin SDK
    await appRef.update({
      status: status || 'draft',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Update App] Error:', error);
    return NextResponse.json({ error: 'Failed to update app' }, { status: 500 });
  }
}

/**
 * DELETE /api/publish/[id] - Delete published app
 */
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    // Verify authentication (supports both Bearer token and custom headers)
    const authUser = await verifyAuthWithFallback(req);
    const userId = authUser.uid;

    // Get the app to verify ownership using Admin SDK
    const appRef = adminDb.collection('publicApps').doc(id);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return new Response(JSON.stringify({ error: 'App not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const appData = appSnap.data();

    // Verify ownership (check both ownerUid and ownerId for backward compatibility)
    if (appData.ownerId !== userId && appData.ownerUid !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized: You do not own this app' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete the document using Admin SDK
    await appRef.delete();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Delete App] Error:', error);
    return NextResponse.json({ error: 'Failed to delete app' }, { status: 500 });
  }
}
