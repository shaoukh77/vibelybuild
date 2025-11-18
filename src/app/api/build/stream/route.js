/**
 * Build Stream API - Real-time Log Streaming
 * GET /api/build/stream?id=BUILD_ID
 *
 * Streams build logs in real-time using Server-Sent Events (SSE)
 * Frontend subscribes to this endpoint to receive live updates
 * Reads from Firestore buildLogs collection
 */

import { verifyAuthWithFallback, verifyOwnership } from '@/lib/authMiddleware';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/build/stream
 * Stream build logs via SSE
 */
export async function GET(request) {
  try {
    // 1. Verify authentication
    const user = await verifyAuthWithFallback(request);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Get build ID from query params
    const { searchParams } = new URL(request.url);
    const buildId = searchParams.get('id');

    if (!buildId) {
      return new Response(
        JSON.stringify({ error: 'Build ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Verify build exists and user owns it
    const buildRef = db.collection('builds').doc(buildId);
    const buildSnap = await buildRef.get();

    if (!buildSnap.exists) {
      return new Response(
        JSON.stringify({ error: 'Build not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const buildData = buildSnap.data();

    // Verify ownership
    if (buildData.userId !== user.uid) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You do not own this build' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[Stream API] Starting stream for build ${buildId}, user ${user.uid}`);

    // 4. Create SSE stream
    const stream = createBuildLogStream(buildId, user.uid, buildData);

    // 5. Return SSE response with proper headers
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Critical for Render.com/Nginx
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });

  } catch (error) {
    console.error('[Stream API] Error:', error);

    // Return JSON error (never HTML)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        code: 'STREAM_ERROR',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Create SSE stream for build logs
 * Subscribes to Firestore and streams updates
 */
function createBuildLogStream(buildId, userId, buildData) {
  const encoder = new TextEncoder();
  let unsubscribeLogs = null;
  let unsubscribeBuild = null;

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send SSE message
      const send = (data) => {
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('[SSE] Failed to send message:', error);
        }
      };

      try {
        // Send initial connection message
        send({ type: 'connected', buildId, timestamp: Date.now() });

        // Send current build status
        send({
          type: 'status',
          status: buildData.status,
          appName: buildData.appName,
          timestamp: Date.now(),
        });

        // Query existing logs (ordered by createdAt)
        const logsSnapshot = await db
          .collection('buildLogs')
          .where('buildId', '==', buildId)
          .where('userId', '==', userId)
          .orderBy('createdAt', 'asc')
          .limit(1000)
          .get();

        // Send existing logs
        logsSnapshot.forEach(doc => {
          const log = doc.data();
          const timestamp = log.createdAt?._seconds ? log.createdAt._seconds * 1000 : Date.now();
          send({
            type: 'log',
            message: log.message,
            level: log.level || 'info',
            timestamp,
          });
        });

        // Subscribe to new logs (real-time)
        const logsQuery = db
          .collection('buildLogs')
          .where('buildId', '==', buildId)
          .where('userId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(1);

        let lastLogTimestamp = logsSnapshot.docs.length > 0
          ? (logsSnapshot.docs[logsSnapshot.docs.length - 1].data().createdAt?._seconds || 0) * 1000
          : 0;

        unsubscribeLogs = logsQuery.onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const log = change.doc.data();
              const logTimestamp = log.createdAt?._seconds ? log.createdAt._seconds * 1000 : Date.now();

              // Only send if it's a new log (after our last known timestamp)
              if (logTimestamp > lastLogTimestamp) {
                send({
                  type: 'log',
                  message: log.message,
                  level: log.level || 'info',
                  timestamp: logTimestamp,
                });
                lastLogTimestamp = logTimestamp;
              }
            }
          });
        }, error => {
          console.error('[SSE] Logs snapshot error:', error);
          send({ type: 'error', message: 'Log subscription error' });
        });

        // Subscribe to build status changes
        const buildRef = db.collection('builds').doc(buildId);

        unsubscribeBuild = buildRef.onSnapshot(doc => {
          if (!doc.exists) {
            send({ type: 'error', message: 'Build not found' });
            return;
          }

          const data = doc.data();
          send({
            type: 'status',
            status: data.status,
            appName: data.appName,
            output: data.output,
            error: data.error,
            timestamp: Date.now(),
          });

          // Close stream when build is complete or failed
          if (data.status === 'complete' || data.status === 'failed') {
            send({ type: 'done', status: data.status, timestamp: Date.now() });

            // Cleanup and close after 1 second
            setTimeout(() => {
              if (unsubscribeLogs) unsubscribeLogs();
              if (unsubscribeBuild) unsubscribeBuild();
              try {
                controller.close();
              } catch (e) {
                // Stream may already be closed
              }
            }, 1000);
          }
        }, error => {
          console.error('[SSE] Build snapshot error:', error);
          send({ type: 'error', message: 'Build subscription error' });
        });

      } catch (error) {
        console.error('[SSE] Stream setup error:', error);
        send({ type: 'error', message: error.message });

        // Cleanup
        if (unsubscribeLogs) unsubscribeLogs();
        if (unsubscribeBuild) unsubscribeBuild();

        try {
          controller.close();
        } catch (e) {
          // Stream may already be closed
        }
      }
    },

    cancel() {
      // Cleanup when client disconnects
      if (unsubscribeLogs) unsubscribeLogs();
      if (unsubscribeBuild) unsubscribeBuild();
      console.log(`[SSE] Client disconnected from build ${buildId}`);
    },
  });

  return stream;
}

/**
 * Handle OPTIONS for CORS (Render.com support)
 */
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
