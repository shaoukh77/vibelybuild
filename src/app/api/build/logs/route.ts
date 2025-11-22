/**
 * Build Logs API - Real-time Log Streaming via SSE
 * GET /api/build/logs?jobId=XYZ
 *
 * Streams build logs in real-time using Server-Sent Events.
 * Frontend subscribes to this endpoint to receive live updates.
 *
 * SSE Message Format:
 * {
 *   step: string,
 *   timestamp: number,
 *   status: "info" | "warn" | "error" | "success",
 *   detail: string,
 *   progress?: number  // 0-100
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { getJob, getJobLogs, getGeneratedFiles, onUIReady } from '@/lib/builder/BuildOrchestrator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get jobId from query params
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const token = searchParams.get('token'); // EventSource can't send headers, so accept token in query

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify authentication - try header first, then query param
    let authUser;
    try {
      authUser = await verifyUser(request);
    } catch (headerError) {
      // If header auth fails, try token from query param
      if (token) {
        // Create a mock request with the token in the header
        const mockRequest = new Request(request.url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        authUser = await verifyUser(mockRequest);
      } else {
        throw headerError;
      }
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

    console.log(`[Build Logs] Starting SSE stream for job ${jobId}, user ${authUser.uid}`);

    // Create SSE stream
    const stream = createLogStream(jobId);

    // Return SSE response
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

  } catch (error: any) {
    console.error('[Build Logs] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to stream logs',
        code: 'LOG_STREAM_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Create SSE stream for job logs
 */
function createLogStream(jobId: string): ReadableStream {
  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout | null = null;
  let lastLogIndex = 0;
  let fileTreeSent = false;
  let previewUrlSent = false;
  let uiReadySent = false;

  const stream = new ReadableStream({
    start(controller) {
      // Helper to send SSE message with named event
      const sendEvent = (eventName: string, data: any) => {
        try {
          const message = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('[SSE] Failed to send message:', error);
        }
      };

      // Register callback for UI Ready event
      onUIReady(jobId, (previewUrl: string) => {
        if (!uiReadySent) {
          console.log(`[SSE] Emitting ui_ready event for ${jobId}: ${previewUrl}`);
          sendEvent('ui_ready', {
            url: previewUrl,
            buildId: jobId,
            timestamp: Date.now(),
          });
          uiReadySent = true;
        }
      });

      // Send initial connection message
      sendEvent('message', {
        log: 'SSE connection established',
        timestamp: Date.now(),
      });

      // Get job
      const job = getJob(jobId);
      if (!job) {
        sendEvent('error', { error: 'Job not found' });
        controller.close();
        return;
      }

      // Send current status
      sendEvent('message', {
        log: `Build status: ${job.status}`,
        timestamp: Date.now(),
      });

      // Send existing logs
      const existingLogs = getJobLogs(jobId);
      existingLogs.forEach((log) => {
        sendEvent('message', {
          log: log.detail || log.message || 'Build log',
          step: log.step,
          status: log.status,
          timestamp: log.timestamp,
        });
      });

      lastLogIndex = existingLogs.length;

      // Poll for new logs every 500ms
      intervalId = setInterval(async () => {
        const currentJob = getJob(jobId);
        if (!currentJob) {
          sendEvent('error', { error: 'Job not found' });
          if (intervalId) clearInterval(intervalId);
          controller.close();
          return;
        }

        // Get new logs
        const allLogs = getJobLogs(jobId);
        const newLogs = allLogs.slice(lastLogIndex);

        newLogs.forEach((log) => {
          sendEvent('message', {
            log: log.detail || log.message || 'Build log',
            step: log.step,
            status: log.status,
            timestamp: log.timestamp,
          });
        });

        lastLogIndex = allLogs.length;

        // Send file tree if job has output and we haven't sent it yet
        if (currentJob.outputPath && !fileTreeSent) {
          try {
            const files = await getGeneratedFiles(jobId);
            if (files.length > 0) {
              console.log('[SSE] Sending fileTree event with', files.length, 'files');
              sendEvent('fileTree', { files });
              fileTreeSent = true;
            }
          } catch (error) {
            console.error('[SSE] Failed to get generated files:', error);
          }
        }

        // If job is complete, failed, or cancelled, close stream
        if (
          currentJob.status === 'complete' ||
          currentJob.status === 'failed' ||
          currentJob.status === 'cancelled'
        ) {
          // Send file tree one more time on completion if we haven't sent it
          if (currentJob.status === 'complete' && !fileTreeSent) {
            try {
              const files = await getGeneratedFiles(jobId);
              if (files.length > 0) {
                console.log('[SSE] Sending final fileTree event with', files.length, 'files');
                sendEvent('fileTree', { files });
                fileTreeSent = true;
              }
            } catch (error) {
              console.error('[SSE] Failed to get generated files on completion:', error);
            }
          }

          // Send preview URL if available
          if (currentJob.status === 'complete' && currentJob.previewUrl && !previewUrlSent) {
            console.log('[SSE] Sending preview_ready event with URL:', currentJob.previewUrl);
            sendEvent('preview_ready', {
              url: currentJob.previewUrl,
              buildId: jobId,
              timestamp: Date.now(),
            });
            previewUrlSent = true;
          }

          // Send error event if build failed
          if (currentJob.status === 'failed' && currentJob.error) {
            console.log('[SSE] Sending build_error event:', currentJob.error);
            sendEvent('build_error', {
              error: currentJob.error,
              buildId: jobId,
              timestamp: Date.now(),
            });
          }

          sendEvent('done', {
            success: currentJob.status === 'complete',
            status: currentJob.status,
            error: currentJob.error,
            timestamp: Date.now(),
          });

          if (intervalId) clearInterval(intervalId);

          // Close after 1 second to ensure message is sent
          setTimeout(() => {
            try {
              controller.close();
            } catch (e) {
              // Stream may already be closed
            }
          }, 1000);
        }
      }, 500);
    },

    cancel() {
      // Cleanup when client disconnects
      if (intervalId) {
        clearInterval(intervalId);
      }
      console.log(`[SSE] Client disconnected from job ${jobId}`);
    },
  });

  return stream;
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
