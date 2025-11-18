/**
 * Real-time SSE Engine
 * Server-Sent Events for build log streaming
 */

import { adminDb } from './firebase-admin';

/**
 * Create SSE stream for build logs
 * @param {string} buildId - Build ID
 * @param {string} userId - User ID (for auth validation)
 * @returns {ReadableStream} SSE stream
 */
export function createBuildLogStream(buildId, userId) {
  const encoder = new TextEncoder();
  let unsubscribe = null;

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send SSE message
      const send = (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Send initial connection message
        send({ type: 'connected', buildId });

        // Get build to verify ownership
        const buildRef = adminDb.collection('builds').doc(buildId);
        const buildSnap = await buildRef.get();

        if (!buildSnap.exists) {
          send({ type: 'error', message: 'Build not found' });
          controller.close();
          return;
        }

        const buildData = buildSnap.data();

        // Verify ownership
        if (buildData.userId !== userId) {
          send({ type: 'error', message: 'Unauthorized' });
          controller.close();
          return;
        }

        // Send current build status
        send({
          type: 'status',
          status: buildData.status,
          appName: buildData.appName
        });

        // Get existing logs
        const logsSnapshot = await adminDb
          .collection('buildLogs')
          .where('buildId', '==', buildId)
          .where('userId', '==', userId)
          .orderBy('createdAt', 'asc')
          .limit(500)
          .get();

        // Send existing logs
        logsSnapshot.forEach(doc => {
          const log = doc.data();
          send({
            type: 'log',
            message: log.message,
            level: log.level || 'info',
            timestamp: log.createdAt?.toMillis?.() || Date.now()
          });
        });

        // Subscribe to new logs
        const logsQuery = adminDb
          .collection('buildLogs')
          .where('buildId', '==', buildId)
          .where('userId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(1);

        unsubscribe = logsQuery.onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const log = change.doc.data();
              send({
                type: 'log',
                message: log.message,
                level: log.level || 'info',
                timestamp: log.createdAt?.toMillis?.() || Date.now()
              });
            }
          });
        }, error => {
          console.error('[SSE] Snapshot error:', error);
        });

        // Subscribe to build status changes
        const buildUnsubscribe = buildRef.onSnapshot(doc => {
          if (!doc.exists) return;

          const data = doc.data();
          send({
            type: 'status',
            status: data.status,
            appName: data.appName,
            deployStatus: data.deployStatus,
            repoUrl: data.repoUrl,
            error: data.error
          });

          // Close stream when build is complete or failed
          if (data.status === 'complete' || data.status === 'failed') {
            send({ type: 'done', status: data.status });

            setTimeout(() => {
              if (unsubscribe) unsubscribe();
              if (buildUnsubscribe) buildUnsubscribe();
              controller.close();
            }, 1000);
          }
        });

      } catch (error) {
        console.error('[SSE] Stream error:', error);
        send({ type: 'error', message: error.message });
        controller.close();
      }
    },

    cancel() {
      if (unsubscribe) {
        unsubscribe();
      }
    }
  });

  return stream;
}

/**
 * Create SSE response headers
 * @returns {object} Response headers
 */
export function getSSEHeaders() {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    // CORS headers for Render.com
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type'
  };
}
