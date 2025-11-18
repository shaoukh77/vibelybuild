import { nanoid } from "nanoid";
import admin, { db } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    // Get user info from headers (dev mode)
    const userId = req.headers.get('x-uid');
    const userName = req.headers.get('x-name');
    const userPhoto = req.headers.get('x-photo');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized: User ID required' }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { buildId, title, description, coverUrl } = await req.json();

    // Validate required fields
    if (!buildId) {
      return new Response(JSON.stringify({ error: 'Build ID required' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!title || !title.trim()) {
      return new Response(JSON.stringify({ error: 'Title required' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get build and validate using Admin SDK
    const buildRef = db.collection('builds').doc(buildId);
    const buildSnap = await buildRef.get();

    if (!buildSnap.exists) {
      return new Response(JSON.stringify({ error: 'Build not found' }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const build = { id: buildSnap.id, ...buildSnap.data() };

    // Verify ownership
    if (build.userId !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized: You do not own this build' }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verify build is complete
    if (build.status !== 'complete') {
      return new Response(JSON.stringify({ error: 'Build must be complete before publishing' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Create public app using Admin SDK
    const appId = nanoid();
    const appRef = db.collection('publicApps').doc(appId);
    await appRef.set({
      ownerId: userId,
      buildId,
      title: title.trim(),
      description: description?.trim() || '',
      coverUrl: coverUrl?.trim() || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'published',
    });

    return new Response(JSON.stringify({ id: appId }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error('Publish error:', error);
    return new Response(JSON.stringify({ error: 'Failed to publish app' }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
